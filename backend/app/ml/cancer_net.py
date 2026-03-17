import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
from io import BytesIO


class CancerNet(nn.Module):
    """Exact architecture from the original Django classifier."""

    def __init__(self):
        super(CancerNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, 3)
        self.conv2 = nn.Conv2d(32, 32, 3)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.conv3 = nn.Conv2d(32, 64, 3)
        self.conv4 = nn.Conv2d(64, 64, 3)
        self.pool2 = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(64 * 13 * 13, 128)
        self.fc2 = nn.Linear(128, 2)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = self.pool1(x)
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        x = self.pool2(x)
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        return self.fc2(x)


_model: CancerNet | None = None


def get_model() -> CancerNet:
    """Load the model once and cache it."""
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), "cancer_detector.pth")
        m = CancerNet()
        m.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
        m.eval()
        _model = m
    return _model


def predict_image(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.
    Returns {"prediction": "cancer"|"normal", "confidence": float 0-100}
    """
    model = get_model()

    try:
        image = Image.open(BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
    except Exception as exc:
        raise ValueError(f"Cannot open image: {exc}") from exc

    transform = transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
    ])

    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        _, idx = torch.max(outputs, 1)
        confidence = probs[0][idx.item()].item()

    prediction = "cancer" if idx.item() == 0 else "normal"
    return {"prediction": prediction, "confidence": round(confidence * 100, 2)}
