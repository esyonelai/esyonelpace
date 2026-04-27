import { useState, useEffect } from 'react'
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function AIModelGenerator({ isOpen, onClose, onModelGenerated }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, generating, success, error
  const [progress, setProgress] = useState(0)
  const [apiKey, setApiKey] = useState(localStorage.getItem('meshy_api_key') || '')
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('meshy_api_key', apiKey)
  }, [apiKey])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setStatus('idle')
      setError('')
    }
  }

  const generateModel = async () => {
    if (!apiKey) {
      setError('Lütfen önce bir Meshy.ai API anahtarı girin.')
      return
    }
    if (!image) {
      setError('Lütfen bir fotoğraf seçin.')
      return
    }

    setStatus('generating')
    setProgress(10)
    setError('')

    try {
      // NOT: Gerçek bir uygulamada bu işlemler güvenlik için backend üzerinden yapılmalıdır.
      // Burada doğrudan API çağrısı yapıyoruz (CORS izin veriyorsa).
      
      // 1. Dosyayı bir URL'e yüklemek gerekir (Meshy URL bekler)
      // Şimdilik bu kısmı simüle ediyoruz veya base64 desteği varsa onu kullanacağız.
      // Meshy genellikle S3 URL'i bekler. Bu yüzden kullanıcıdan doğrudan link de alabiliriz.
      
      // ÖRNEK AKIŞ (MOCK):
      let p = 10;
      const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        if (p >= 90) {
          clearInterval(interval);
          finishGeneration();
        }
      }, 1500);

      const finishGeneration = () => {
        setStatus('success');
        setProgress(100);
        // Örnek bir model URL'i dönüyoruz
        onModelGenerated('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/motorcycle/model.gltf');
      };

    } catch (err) {
      setStatus('error');
      setError('Üretim sırasında bir hata oluştu: ' + err.message);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-[#333] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#333] flex items-center justify-between bg-[#222]">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-gray-200 text-lg">AI 3D Model Üretici</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* API Key Input */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Meshy.ai API Key</label>
            <input 
              type="password"
              placeholder="msy_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2 text-sm text-gray-200 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
              Bu özellik için bir API anahtarı gereklidir. <a href="https://meshy.ai" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Meshy.ai</a> üzerinden ücretsiz alabilirsiniz.
            </p>
          </div>

          {/* Image Upload Area */}
          <div 
            onClick={() => document.getElementById('ai-image-upload').click()}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group
              ${imagePreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-[#333] hover:border-gray-500 bg-[#1a1a1a]'}
            `}
          >
            <input type="file" id="ai-image-upload" hidden accept="image/*" onChange={handleImageChange} />
            
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-40 h-40 object-contain rounded-lg shadow-lg" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-500 group-hover:text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-300">Bir Fotoğraf Seçin</p>
                  <p className="text-xs text-gray-500 mt-1">Veya buraya sürükleyin</p>
                </div>
              </>
            )}
          </div>

          {/* Status Display */}
          {status === 'generating' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-400 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Yapay Zeka Modeli Örüyor...
                </span>
                <span className="text-gray-400">%{progress}</span>
              </div>
              <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">Model başarıyla üretildi ve uygulandı!</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-bold rounded-xl transition-all"
            >
              Vazgeç
            </button>
            <button 
              disabled={status === 'generating' || !image}
              onClick={generateModel}
              className={`flex-[2] px-4 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20
                ${status === 'generating' || !image ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}
              `}
            >
              {status === 'generating' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Şimdi 3D Yap
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
