import torch
import torchaudio
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
from typing import Dict, Any, List
import os

class ModelHF:
    def __init__(self):
        """Initialize local audio event detection model"""
        # Load pre-trained model and feature extractor
        self.model = Wav2Vec2ForSequenceClassification.from_pretrained("superb/wav2vec2-base-superb-ks")
        self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("superb/wav2vec2-base-superb-ks")
        
        # Audio event keywords for annotation
        self.audio_events = {
            0: "(!!PAUSE!!)",        # Map model outputs to your annotations
            1: "(!!HESITATION!!)",
            2: "(!!RAISED_VOICE!!)",
            3: "(!!DOUBT!!)",
            4: "(!!CONFIDENCE!!)"
        }
        
        # Set model to evaluation mode
        self.model.eval()

    def detect_audio_events(self, audio_path: str) -> List[Dict[str, Any]]:
        """Detect audio events in an audio file and return annotations
        
        Args:
            audio_path (str): Path to the audio file
            
        Returns:
            List[Dict]: List of dictionaries containing 'timestamp' and 'annotation'
            
        Raises:
            FileNotFoundError: If the audio file doesn't exist
            Exception: For processing errors
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Verify and convert audio file format
        try:
            # Check if file exists and is readable
            if not os.path.isfile(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
            # Try loading directly without checking supported formats
            try:
                waveform, sample_rate = torchaudio.load(audio_path)
            except Exception as e:
                # Attempt conversion if direct loading fails
                try:
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp_file:
                        # Convert to WAV format
                        # Note: This part might still fail if waveform isn't defined yet
                        # Let's handle this case differently
                        raise ValueError(f"Could not load audio file: {audio_path}. Error: {str(e)}")
                except Exception as conv_e:
                    raise ValueError(f"Unsupported audio format: {audio_path}. Error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error processing audio file: {audio_path}. Error: {str(e)}")

        try:
            # At this point, we have a valid waveform and sample_rate
            # Resample audio to 16000Hz if needed
            if sample_rate != 16000:
                resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
                waveform = resampler(waveform)
            
            # Process audio in chunks (e.g., 1 second windows)
            chunk_size = 16000  # 1 second at 16kHz
            annotations = []
            
            for i in range(0, waveform.shape[1], chunk_size):
                chunk = waveform[:, i:i+chunk_size]
                if chunk.shape[1] < chunk_size:
                    continue  # Skip incomplete chunks
                
                inputs = self.feature_extractor(
                    chunk.squeeze().numpy(),
                    sampling_rate=16000,
                    return_tensors="pt",
                    padding=True
                )
                
                with torch.no_grad():
                    logits = self.model(inputs.input_values).logits
                    predicted_class_id = torch.argmax(logits, dim=-1).item()
                
                if predicted_class_id in self.audio_events:
                    timestamp = i / 16000  # Convert sample index to time in seconds
                    annotations.append({
                        'timestamp': timestamp,
                        'annotation': self.audio_events[predicted_class_id],
                        'confidence': torch.softmax(logits, dim=-1)[0][predicted_class_id].item()
                    })
            
            return annotations
            
        except Exception as e:
            raise Exception(f"Error detecting audio events: {str(e)}")