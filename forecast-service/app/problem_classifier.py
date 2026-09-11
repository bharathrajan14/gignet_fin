import os
import time
import csv
import logging
from typing import Dict, Any, List, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger("gignet.classifier")
logging.basicConfig(level=logging.INFO)

class ProblemClassifier:
    """
    Production inference engine for the GIGNET DistilBERT text classification model.
    Loads once during application startup into memory (CPU).
    """

    def __init__(self, model_dir: Optional[str] = None):
        self.model_dir = model_dir or os.environ.get(
            "MODEL_PATH",
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "gignet_distilbert")
        )
        self.tokenizer = None
        self.model = None
        self.id2label: Dict[int, str] = {}
        self.label2id: Dict[str, int] = {}
        self.is_loaded = False
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.load_time_seconds: float = 0.0
        self.model_version: str = "v1"

    def load(self):
        if self.is_loaded:
            logger.info("ProblemClassifier model already loaded.")
            return

        if not os.path.exists(self.model_dir):
            raise FileNotFoundError(
                f"Model directory not found at: {self.model_dir}. Please ensure model artifacts are present."
            )

        logger.info(f"Loading GIGNET DistilBERT model from {self.model_dir} on {self.device}...")
        start_time = time.time()

        # Load authoritative label mapping from label_mapping.csv if present
        label_csv_path = os.path.join(self.model_dir, "label_mapping.csv")
        if os.path.exists(label_csv_path):
            with open(label_csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    label = row["label"].strip()
                    lid = int(row["label_id"].strip())
                    self.id2label[lid] = label
                    self.label2id[label] = lid
            logger.info(f"Loaded {len(self.id2label)} canonical labels from label_mapping.csv")

        # Load Tokenizer & Model using Hugging Face Transformers
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_dir)

        # Fallback to model config id2label if CSV had no entries
        if not self.id2label and hasattr(self.model.config, "id2label"):
            for k, v in self.model.config.id2label.items():
                self.id2label[int(k)] = v
                self.label2id[v] = int(k)

        self.model.to(self.device)
        self.model.eval()

        self.load_time_seconds = time.time() - start_time
        self.is_loaded = True
        logger.info(
            f"Successfully loaded DistilBERT model in {self.load_time_seconds:.2f}s "
            f"(Architecture: {self.model.__class__.__name__}, Labels: {len(self.id2label)}, Device: {self.device})"
        )

    def predict(self, description: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Classify customer natural language problem description.
        Returns predictedLabel, subSkillId, confidence, source, modelVersion, and topPredictions.
        """
        if not self.is_loaded:
            self.load()

        if not description or not description.strip():
            raise ValueError("Input description must not be empty.")

        clean_text = description.strip()

        # Tokenize with exact supplied configuration: truncation, padding, PyTorch tensors
        inputs = self.tokenizer(
            clean_text,
            truncation=True,
            padding=True,
            max_length=64,
            return_tensors="pt"
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)[0]

        # Top predictions
        k_val = min(top_k, len(probabilities))
        top_probs, top_indices = torch.topk(probabilities, k=k_val)

        top_idx = int(top_indices[0].item())
        top_confidence = float(top_probs[0].item())
        predicted_sub_skill = self.id2label.get(top_idx, f"unknown_{top_idx}")

        top_predictions: List[Dict[str, Any]] = []
        for prob, idx in zip(top_probs, top_indices):
            sub_id = self.id2label.get(int(idx.item()), f"unknown_{int(idx.item())}")
            top_predictions.append({
                "predictedLabel": sub_id,
                "subSkillId": sub_id,
                "confidence": round(float(prob.item()), 4)
            })

        return {
            "predictedLabel": predicted_sub_skill,
            "subSkillId": predicted_sub_skill,
            "confidence": round(top_confidence, 4),
            "source": "distilbert",
            "modelVersion": self.model_version,
            "topPredictions": top_predictions
        }


# Global singleton instance
classifier_instance = ProblemClassifier()
