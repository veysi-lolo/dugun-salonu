# ✦ Altın Saray — Premium Düğün Mekânları (v2)

İstanbul'un en prestijli düğün mekânı için hazırlanmış, yarışma kalitesinde premium web sitesi.

## Yenilikler (v2)

- 🎨 **Playfair Display + Raleway** font kombinasyonu — gerçek lüks his
- ✨ **Yumuşak sayfa geçişleri** — fadeUp animasyonu
- 📅 **Gelişmiş takvim sistemi** — Her gün ikiye bölünmüş (gündüz / akşam)
- 🟢 **Müsait** → yeşil tonlama
- 🔴 **Dolu** → kırmızı tonlama (tıklanamaz)
- 🟡 **Seçili** → altın tonlama
- Aynı güne çift tıkla → **Tam Gün** rezervasyonu
- Hover animasyonları, sticky nav gölgesi, rafine tipografi

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `index.html` | Tüm HTML yapısı |
| `style.css` | Premium stiller + animasyonlar |
| `script.js` | Takvim mantığı, form, sayfa geçişleri |

## GitHub Pages ile Canlıya Al

1. Tüm dosyaları `dugun-salonu` reposuna yükle
2. **Settings → Pages → Branch: main → / (root) → Save**
3. Site: `https://veysi-lolo.github.io/dugun-salonu/`

## Renk Sistemi

| Token | Değer | Kullanım |
|-------|-------|---------|
| `--gold` | `#D4AF37` | Ana aksanlar |
| `--dark` | `#0e0e0e` | Arka plan |
| `--free-bg` | yeşil ton | Müsait slot |
| `--book-bg` | kırmızı ton | Dolu slot |
| `--sel-bg` | altın ton | Seçili slot |

## Takvim Slot Mantığı

Her takvim hücresi **üst yarı (gündüz)** ve **alt yarı (akşam)** olarak ikiye bölünmüştür.

- Üst yarıya tıkla → **Gündüz (13:00–17:00)** seçilir
- Alt yarıya tıkla → **Akşam (19:00–23:00)** seçilir
- İki yarıya da tıkla → **Tam Gün** seçilir
- Kırmızı yarılar dolu, tıklanamaz

Gerçek projede `bookings` objesi API/backend'den doldurulur.
