import { useRef, useState, type ChangeEvent } from 'react';
import { ExternalLink, FileImage, ShieldCheck, Upload } from 'lucide-react';

type MediaKind = 'windows-iso' | 'macos-media';

export type StagedMedia = {
  kind: MediaKind;
  name: string;
  size: number;
  type: string;
};

const formatBytes = (value: number) => {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const OfficialMediaPanel = ({ stagedMedia, onStage }: { stagedMedia: StagedMedia | null; onStage: (media: StagedMedia) => void }) => {
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
    onStage({ kind, name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
  };
  return <section className="official-media-panel"><div className="official-media-heading"><div className="advanced-icon"><FileImage size={17} /></div><div><span className="app-eyebrow">OFFICIAL INSTALL MEDIA</span><h3>Bring your own image.</h3><p>Media stays under your control. WebOS only stages the file metadata in this browser session; it does not upload or execute installers.</p></div><span className="advanced-status"><ShieldCheck size={12} /> USER-SUPPLIED ONLY</span></div><div className="official-media-grid"><article><div className="official-media-title"><strong>Windows 11 ISO</strong><span>MICROSOFT</span></div><p>The Media Creation Tool is a Windows x64 executable. On macOS, use Microsoft’s official ISO download page instead.</p><div className="official-media-actions"><a href="https://www.microsoft.com/software-download/windows11" target="_blank" rel="noreferrer">Official ISO page <ExternalLink size={12} /></a><a href="https://go.microsoft.com/fwlink/?linkid=2156295" target="_blank" rel="noreferrer">Media Creation Tool <ExternalLink size={12} /></a><button type="button" onClick={() => chooseMedia('windows-iso')}><Upload size={12} /> Stage ISO</button></div></article><article><div className="official-media-title"><strong>macOS installer</strong><span>APPLE</span></div><p>Apple’s current supported workflow creates an installer app. Official DMG downloads are limited to older releases; a browser cannot boot macOS.</p><div className="official-media-actions"><a href="https://support.apple.com/102662" target="_blank" rel="noreferrer">Download macOS <ExternalLink size={12} /></a><a href="https://support.apple.com/101578" target="_blank" rel="noreferrer">Create installer <ExternalLink size={12} /></a><button type="button" onClick={() => chooseMedia('macos-media')}><Upload size={12} /> Stage media</button></div></article></div><input ref={inputRef} type="file" hidden accept=".iso,.dmg,.img,.qcow2,.vhdx" onChange={onFile} />{stagedMedia && <div className="staged-media"><FileImage size={14} /><strong>{stagedMedia.name}</strong><span>{formatBytes(stagedMedia.size)} · {stagedMedia.kind === 'windows-iso' ? 'Windows media' : 'macOS media'} · staged locally</span></div>}</section>;
};
