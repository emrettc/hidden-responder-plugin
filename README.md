# Artı Not

Chrome/Edge'de görünen her metin bloğunun sonuna bir **+** koyan Windows masaüstü
uygulaması. Artıya tıklayınca metnin **Türkçesini**, **açıklamasını** ve metin bir
soruysa **cevabını** küçük bir panelde gösterir. Yapay zeka kendi bilgisayarınızda
(ekran kartınızda) çalışır; ücretli API gerekmez.

Yabancı dilde belge, e-posta ya da web sayfası okurken ve müşteri toplantılarında
ekran paylaşırken kendi notlarınızın karşı tarafa yansımaması için tasarlandı.

## Özellikler

- **Sayfaya dokunmaz.** Eklenti sayfaya hiçbir şey eklemez; yalnızca görünen metin
  bloklarının ekran konumunu yerel uygulamaya bildirir. Artıları masaüstü
  uygulaması kendi şeffaf katmanında çizer.
- **Çeviri + açıklama + cevap.** Her tıklamada üç bölüm: metnin Türkçesi, 2-4
  cümlelik sade açıklama ve metin soruysa kısa gerekçeli cevap. Yanıt yazılırken
  canlı olarak akar.
- **Yerel yapay zeka.** Varsayılan olarak [Ollama](https://ollama.com) ile ekran
  kartınızda çalışır; metinler bilgisayarınızdan çıkmaz.
- **İsteğe bağlı ücretsiz API.** Ekran kartı yetmezse OpenAI uyumlu herhangi bir
  servise (ücretsiz katmanı olanlar dahil) `config.json` üzerinden bağlanır.
- **Ekran paylaşımında görünmez.** Artılar ve panel, Windows'un ekran yakalamadan
  hariç tutma özelliğiyle (`WDA_EXCLUDEFROMCAPTURE`) işaretlidir; paylaşımda,
  kayıtta ve ekran görüntüsünde çıkmaz. Görev çubuğunda da simge oluşmaz.
- **Araya girmez.** Artılar yalnızca tarayıcı öndeyken görünür, tıklama dışındaki
  her şey alttaki pencereye geçer, odak tarayıcıda kalır. Tek düğmeyle kapatılır.
- **Kurulumu hafif.** Yalnızca Python standart kütüphanesi; ek paket yok.

## Gereksinimler

- Windows 10 (sürüm 2004 ve sonrası) ya da Windows 11
- Python 3
- Chrome ya da Edge
- Yerel model için Ollama (ya da ücretsiz bir API anahtarı)

## Kurulum

1. **Python**: python.org'dan Python 3'ü kurun. Kurulumda "Add python.exe to PATH"
   kutusunu işaretleyin.
2. **Yerel model**: ollama.com/download adresinden Ollama'yı kurun, yeni bir komut
   satırı açıp şunu çalıştırın:

       ollama pull gemma3:4b

   8 GB ve üzeri ekran kartı belleğiniz varsa daha büyük bir model seçip
   `config.json` içindeki `ollama_model` değerini değiştirebilirsiniz.
3. **Eklenti**: `chrome://extensions` (Edge'de `edge://extensions`) sayfasında
   "Geliştirici modu"nu açın, "Paketlenmemiş öğe yükle" ile bu depodaki `eklenti`
   klasörünü seçin. Açık sekmeleri bir kez yenileyin.

## Kullanım

`baslat.bat` dosyasına çift tıklayın. "Artı Not" paneli açılır; tarayıcı öndeyken
metinlerin sonunda mavi + işaretleri belirir.

- **+**: metni çevirir, açıklar, soruysa yanıtlar.
- **Artılar: Açık/Kapalı**: işaretleri geçici olarak gizler.
- **Kopyala**: paneldeki yanıtı panoya alır.
- **Çıkış** ya da paneli kapatmak uygulamayı kapatır.

Panelin durum satırında "Ekran paylaşımında gizli" yazmalıdır. İlk toplantıdan
önce kendinize bir deneme paylaşımı ya da kaydı yapıp kontrol edin.

## Ayarlar

İlk çalıştırmada `config.json` oluşur (örneği: `config.example.json`).

| Ayar | Açıklama |
| --- | --- |
| `provider` | `"ollama"` (yerel) ya da `"api"` |
| `ollama_model` | Kullanılacak yerel model |
| `api_base`, `api_key`, `api_model` | OpenAI uyumlu servis bilgileri |
| `port` | Eklenti ile uygulama arasındaki yerel port (eklentide de 8765) |
| `offset_x`, `offset_y` | Artılar kayıksa piksel düzeltmesi |
| `browsers` | Artıların gösterileceği tarayıcı süreçleri |

API kullanırken tıkladığınız metin o servise gönderilir; yerel modelde hiçbir şey
bilgisayarınızdan çıkmaz.

## Nasıl çalışır

```
Chrome/Edge eklentisi  --(metin + ekran konumu, 127.0.0.1:8765)-->  app.py
app.py  --> şeffaf, tıklama geçiren, yakalamadan hariç katmanda "+" çizer
"+" tıklaması  --> Ollama (ya da API)  --> panelde akan yanıt
```

Uygulama yalnızca `127.0.0.1` üzerinde dinler ve yalnızca tarayıcı eklentisinden
gelen istekleri kabul eder.

## Sorun giderme

- **Artılar kayık**: tarayıcı yakınlaştırmasını %100 yapın (Ctrl+0) ve fareyi
  sayfanın üzerinde bir kez gezdirin. Hâlâ kayıksa `offset_x` / `offset_y` verin.
- **Hiç artı yok**: eklenti yüklü mü, sekme yenilendi mi, uygulama çalışıyor mu?
  Hatalar `app.log` dosyasına yazılır.
- **"Ollama'ya bağlanılamadı"**: Ollama kurulu ve çalışıyor olmalı (Başlat > Ollama).
- **"Model bulunamadı"**: `ollama pull gemma3:4b` komutunu çalıştırın.

## Sınırlar

- Yalnızca Windows; yalnızca Chrome ve Edge.
- PDF görüntüleyicide, `chrome://` sayfalarında ve gömülü çerçevelerin (iframe)
  içinde çalışmaz.
- Gizleme Windows'un yakalama API'sine dayanır; her paylaşım aracında garanti
  değildir, kullanmadan önce deneyin.
- Yerel küçük modeller hata yapabilir; önemli çeviri ve cevapları doğrulayın.

## Kullanım notu

Bu araç kişisel okuma ve iş toplantıları içindir. Gözetimli sınav, mülakat ya da
yardım almanın yasak olduğu başka ortamlarda kullanılmamalıdır.
