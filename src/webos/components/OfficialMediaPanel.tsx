import { useRef, useState, type ChangeEvent } from 'react';
import { ExternalLink, FileImage, Play, ShieldCheck, Upload } from 'lucide-react';

type MediaKind = 'windows-iso' | 'macos-media';

export type StagedMedia = {
  kind: MediaKind;
  file: File;
  name: string;
  size: number;
  type: string;
};

export const isV86CompatibleFilename = (name: string) => /\.(iso|img|bin|hdd)$/i.test(name);

const formatBytes = (value: number) => {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const OfficialMediaPanel = ({ stagedMedia, onStage, onRun }: { stagedMedia: StagedMedia | null; onStage: (media: StagedMedia) => void; onRun: (media: StagedMedia) => void }) => {
  const [kind, setKind] = useState<MediaKind>('windows-iso');
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseMedia = (nextKind: MediaKind) => {
    setKind(nextKind);
    inputRef.current?.click();
  };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onStage({ kind, file, name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
  };
  const compatible = stagedMedia ? isV86CompatibleFilename(stagedMedia.name) && stagedMedia.kind === 'windows-iso' : false;
  return <section className="official-media-panel"><div className="official-media-heading"><div className="advanced-icon"><FileImage size={17} /></div><div><span className="app-eyebrow">ACTUAL GUEST MEDIA</span><h3>Bring a compatible image.</h3><p>Compatible x86 images can boot through the bundled v86 WebAssembly emulator. Media stays in this browser tab; it is never uploaded or executed by the host.</p></div><span className="advanced-status"><ShieldCheck size={12} /> SANDBOXED GUEST</span></div><div className="official-media-grid"><article><div className="official-media-title"><strong>Windows / x86 image</strong><span>V86 COMPATIBLE</span></div><p>v86 can boot some legacy x86 Windows releases and Linux images. Windows 11 is x86-64/UEFI/TPM and is not supported by v86.</p><div className="official-media-actions"><a href="https://www.microsoft.com/software-download/windows11" target="_blank" rel="noreferrer">Official Microsoft media <ExternalLink size={12} /></a><button type="button" onClick={() => chooseMedia('windows-iso')}><Upload size={12} /> Choose image</button></div></article><article><div className="official-media-title"><strong>macOS media</strong><span>NOT BROWSER-BOOTABLE</span></div><p>Modern macOS requires Apple hardware/firmware and cannot be booted by this browser emulator. Use Apple’s installer guidance with a licensed native VM or Mac.</p><div className="official-media-actions"><a href="https://support.apple.com/102662" target="_blank" rel="noreferrer">Apple download guide <ExternalLink size={12} /></a><a href="https://support.apple.com/101578" target="_blank" rel="noreferrer">Bootable installer guide <ExternalLink size={12} /></a><button type="button" onClick={() => chooseMedia('macos-media')}><Upload size={12} /> Stage for reference</button></div></article></div><input ref={inputRef} type="file" hidden accept=".iso,.dmg,.img,.bin,.hdd" onChange={onFile} />{stagedMedia && <div className="staged-media"><FileImage size={14} /><strong>{stagedMedia.name}</strong><span>{formatBytes(stagedMedia.size)} · {stagedMedia.kind === 'windows-iso' ? 'x86 guest candidate' : 'macOS reference'} · staged locally</span>{compatible && <button type="button" onClick={() => onRun(stagedMedia)}><Play size={12} /> Run actual guest</button>}</div>}</section>;
};
