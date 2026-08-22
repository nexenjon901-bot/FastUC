from pathlib import Path
import shutil
import numpy as np
from PIL import Image

assets = Path(r"C:\Users\user\.cursor\projects\c-Users-user-Desktop-FastPAY-restore\assets")
out_dir = Path(r"C:\Users\user\Desktop\FastPAY-restore\frontend\public")
out_dir.mkdir(parents=True, exist_ok=True)

stars_src = assets / "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-92a14e7f-9783-47a4-881b-8e492af2b871.png"
uc_src = assets / "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-556e3a3d-aa0e-418d-971d-62c51689393c.png"
banner_src = assets / "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-c245068c-12c7-45af-8f68-4c9c31ed0579.png"


def trim_alpha(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def remove_near_black(img: Image.Image, thresh: float = 28, soft: float = 16) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = arr[..., :3]
    dist = np.sqrt(np.sum(rgb ** 2, axis=-1))
    alpha = arr[..., 3].copy()
    alpha[dist <= thresh] = 0
    soft_mask = (dist > thresh) & (dist < thresh + soft)
    alpha[soft_mask] *= (dist[soft_mask] - thresh) / soft
    arr[..., 3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


stars = Image.open(stars_src)
print("stars", stars.mode, stars.size)
stars = remove_near_black(stars)
stars = trim_alpha(stars)
stars.thumbnail((512, 512), Image.Resampling.LANCZOS)
stars_out = out_dir / "icon-stars.png"
stars.save(stars_out, "PNG")
print("saved", stars_out, stars.size)

uc = Image.open(uc_src)
print("uc", uc.mode, uc.size)
uc = remove_near_black(uc, thresh=32, soft=20)
uc = trim_alpha(uc)
uc.thumbnail((640, 640), Image.Resampling.LANCZOS)
uc_out = out_dir / "icon-uc.png"
uc.save(uc_out, "PNG")
print("saved", uc_out, uc.size)

banner_out = out_dir / "accounts-banner.png"
shutil.copy2(banner_src, banner_out)
print("saved", banner_out, Image.open(banner_out).size)
