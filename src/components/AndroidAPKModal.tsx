import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface AndroidAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AndroidAPKModal: React.FC<AndroidAPKModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk'>('install');

  if (!isOpen) return null;

  const currentAppUrl = window.location.href.split('?')[0];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    onShowToast('Link aplikasi berhasil disalin!', 'success');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast('Aplikasi berhasil dipasang di Android Anda!', 'success');
        onClose();
      }
    } else {
      onShowToast('Buka menu Chrome (titik tiga) lalu pilih "Instal aplikasi"', 'info');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Smartphone className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Jalankan di Android / Unduh APK
              </h3>
              <p className="text-xs text-indigo-200">
                Pilih cara menjalankan aplikasi di smartphone Android Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 flex border-b border-slate-200 bg-white text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'install'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Pasang Langsung di HP (Direkomendasikan)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Buat File .APK Mandiri</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-5 text-slate-700 text-sm">
          {activeTab === 'install' ? (
            <div className="space-y-4">
              {/* Highlight Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold">Aplikasi Web Standar PWA (Progressive Web App)</p>
                  <p className="text-emerald-800 text-xs leading-relaxed">
                    Aplikasi ini telah dilengkapi teknologi PWA resmi Google. Saat dipasang di Android, aplikasi akan muncul di menu aplikasi (App Drawer) dengan ikon resmi, terbuka <strong>layar penuh tanpa bilah browser</strong>, serta menyimpan data presensi & nilai secara offline dan tersinkron ke cloud!
                  </p>
                </div>
              </div>

              {/* Install action button if available */}
              {isInstallable && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center space-y-2">
                  <p className="text-xs font-semibold text-indigo-900">
                    Browser Anda mendukung pemasangan langsung dengan 1 kali klik:
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi Sekarang</span>
                  </button>
                </div>
              )}

              {/* Step by step installation guide */}
              <div className="space-y-3 pt-1">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Langkah Memasang di HP Android via Google Chrome:</span>
                </h4>

                <ol className="space-y-3 text-xs sm:text-sm">
                  <li className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl items-start">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="font-bold text-slate-800">Salin Link Webapp Ini:</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={currentAppUrl}
                          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 w-full truncate font-mono"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>
                  </li>

                  <li className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl items-start">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="font-bold text-slate-800">Buka di Browser Google Chrome di HP</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Buka browser Google Chrome di ponsel Android Anda, lalu tempel tautan yang disalin di atas.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl items-start">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="font-bold text-slate-800">Tekan Menu Titik Tiga (⋮) di Pojok Kanan Atas</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl items-start">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                    <div>
                      <p className="font-bold text-slate-800">Selesai! Aplikasi Siap Digunakan</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ikon <strong>Presensi Guru SDN 5</strong> akan muncul di beranda dan laci aplikasi ponsel Anda seperti aplikasi native Play Store.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika Anda memerlukan berkas fisik berformat <strong>.APK</strong> untuk dibagikan ke sesama guru atau dipasang secara offline, Anda dapat membuat file APK secara instan dan gratis menggunakan layanan pembungkus TWA (Trusted Web Activity) resmi:
              </p>

              {/* Method 1: PWABuilder */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Metode 1: PWABuilder (Gratis & Paling Mudah)</h4>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Sangat Direkomendasikan
                  </span>
                </div>

                <ol className="text-xs space-y-1.5 list-decimal list-inside text-slate-600 leading-relaxed">
                  <li>Buka situs resmi <strong>PWABuilder</strong> (<a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium inline-flex items-center gap-0.5">pwabuilder.com <ExternalLink className="w-3 h-3" /></a>).</li>
                  <li>Masukkan URL aplikasi web ini di kolom yang tersedia.</li>
                  <li>Klik tombol <strong>"Start"</strong>, lalu pilih <strong>"Package for Android"</strong>.</li>
                  <li>PWABuilder akan otomatis mengemas aplikasi ke dalam berkas <strong>.APK</strong> siap pasang dan paket <strong>.AAB</strong> untuk Google Play Store!</li>
                </ol>

                <div className="pt-1">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    <span>Buka PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Method 2: Web2APK Tools */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Metode 2: Web to APK Builder / AppsGeyser</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Anda juga dapat menggunakan aplikasi pembuat APK seperti <em>Web to APK</em> atau <em>AppsGeyser</em> dengan memasukkan URL webapp ini. Aplikasi APK yang dihasilkan akan membuka sistem presensi ini secara otomatis dengan performa cepat.
                </p>
              </div>

              {/* Copy URL Reminder */}
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-900">
                <span className="truncate">URL Webapp: <strong className="font-mono">{currentAppUrl}</strong></span>
                <button
                  onClick={handleCopyUrl}
                  className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 hover:bg-indigo-500 transition"
                >
                  {copiedUrl ? 'Tersalin' : 'Salin URL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
