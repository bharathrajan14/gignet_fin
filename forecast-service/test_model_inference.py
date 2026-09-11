import os
import sys
import unittest

# Ensure app is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.problem_classifier import classifier_instance

class TestProblemClassifier(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\nLoading DistilBERT classification model...")
        classifier_instance.load()
        assert classifier_instance.is_loaded, "Model failed to load"
        print(f"Model loaded in {classifier_instance.load_time_seconds:.2f}s on {classifier_instance.device}")

    def test_required_inference_cases(self):
        test_cases = [
            ("Kitchen pipe is leaking badly", "plumber_pipe_leakage"),
            ("Tap keeps dripping", "plumber_tap_leakage"),
            ("Bathroom drain is blocked", "plumber_drain_blockage"),
            ("Ceiling fan stopped working", "electrician_fan"),
            ("Washing machine installation needed", "electrician_washing_machine"),
            ("Car tyre is punctured", "mechanic_tyre_puncture"),
            ("I need airport pickup", "driver_airport_transport"),
        ]

        print("\n========================================================")
        print("RUNNING REAL MODEL INFERENCE VALIDATION (DistilBERT v1)")
        print("========================================================")

        for text, expected_prefix in test_cases:
            res = classifier_instance.predict(text, top_k=3)
            pred = res["predictedLabel"]
            conf = res["confidence"]
            sub_id = res["subSkillId"]
            top3 = res["topPredictions"]

            print(f"\nPrompt:      '{text}'")
            print(f"Predicted:   {pred} (subSkillId: {sub_id})")
            print(f"Confidence:  {conf * 100:.2f}%")
            top_str = ', '.join([f"{c['subSkillId']} ({c['confidence']*100:.1f}%)" for c in top3])
            print(f"Top 3:       {top_str}")

            self.assertEqual(res["source"], "distilbert")
            self.assertEqual(res["modelVersion"], "v1")
            self.assertGreater(conf, 0.50, f"Confidence too low for '{text}'")
            # Verify predicted matches expected label
            self.assertEqual(pred, expected_prefix, f"Mismatch for '{text}'! Got {pred}, expected {expected_prefix}")

if __name__ == "__main__":
    unittest.main()
