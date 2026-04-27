import { useState, useEffect } from 'react'
import { Search, Loader2, Download, AlertCircle, X, Box } from 'lucide-react'

export default function SketchfabBrowser({ isOpen, onClose, onModelSelected }) {
  const [query, setQuery] = useState('nmax')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState(localStorage.getItem('sketchfab_api_key') || 'e5a167f741c44ba78c3df6a5c679e115')

  useEffect(() => {
    localStorage.setItem('sketchfab_api_key', apiKey)
  }, [apiKey])

  const searchModels = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim() || !apiKey) return

    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      })
      
      if (!res.ok) throw new Error('Arama başarısız. API anahtarınızı kontrol edin.')
      
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // İlk açılışta aramayı otomatik yap
  useEffect(() => {
    if (isOpen && apiKey && results.length === 0) {
      searchModels()
    }
  }, [isOpen])

  const downloadModel = async (uid) => {
    setDownloadingId(uid)
    setError('')
    try {
      const res = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      })
      
      if (!res.ok) throw new Error('İndirme bağlantısı alınamadı.')
      
      const data = await res.json()
      
      if (data.glb && data.glb.url) {
        onModelSelected(data.glb.url)
      } else if (data.gltf && data.gltf.url) {
        // Eğer GLB yoksa fallback (Bazen sadece zip içinden gltf çıkar, three.js direkt url'den zip okuyamaz ama şansımızı deniyoruz veya kullanıcıyı uyarıyoruz)
        onModelSelected(data.gltf.url)
      } else {
        throw new Error('Uygun format bulunamadı (.glb)')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-[#333] w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#333] flex items-center justify-between bg-[#222]">
          <div className="flex items-center gap-3 text-blue-400">
            <Box className="w-6 h-6" />
            <h2 className="font-bold text-gray-200 text-lg">Sketchfab 3D Model Kütüphanesi</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-[#333] p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          
          <form onSubmit={searchModels} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Örn: nmax, fridge, chair..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ara'}
            </button>
          </form>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {isLoading && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-medium">Modeller aranıyor...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((model) => {
                  const thumbnail = model.thumbnails?.images?.find(img => img.width >= 300)?.url || model.thumbnails?.images?.[0]?.url;
                  const isDownloading = downloadingId === model.uid;

                  return (
                    <div key={model.uid} className="bg-[#2a2a2a] border border-[#444] rounded-xl overflow-hidden hover:border-blue-500 transition-colors group flex flex-col">
                      <div className="aspect-square relative bg-[#111] overflow-hidden">
                        {thumbnail ? (
                          <img src={thumbnail} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><Box className="w-10 h-10" /></div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-gray-300">
                          {(model.vertexCount / 1000).toFixed(1)}k Verts
                        </div>
                      </div>
                      
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="text-xs font-bold text-gray-200 line-clamp-1 mb-1" title={model.name}>{model.name}</h3>
                        <p className="text-[10px] text-gray-500 mb-3">{model.user?.displayName}</p>
                        
                        <div className="mt-auto">
                          <button 
                            onClick={() => downloadModel(model.uid)}
                            disabled={isDownloading}
                            className="w-full py-2 bg-[#333] hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600/20 group-hover:text-blue-400"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="w-4 h-4" /> Seç ve İndir
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : query && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                <Search className="w-12 h-12 text-[#333]" />
                <p className="font-medium">Sonuç bulunamadı.</p>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  )
}
