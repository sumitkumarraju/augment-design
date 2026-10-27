# WebOS implementation plan

## User-visible result

1. A visitor lands on a virtual computer manager and chooses Windows, macOS, or Linux.
2. The selected machine opens inside a centered, responsive laptop frame with an OS-specific startup sequence.
3. The desktop becomes interactive after the honest simulated boot completes: windows can be opened, focused, dragged, resized, minimized, maximized, and closed.
4. File Manager and Terminal share the same isolated virtual filesystem. Text Editor, Calculator, Browser, Settings, Monitor, Notes, Calendar, Store, and the existing AUGMENT research workspace are real applications in the registry.
5. Temporary and persistent storage modes are distinct. Persistent files use IndexedDB with a localStorage fallback; temporary files live only in the active browser session.
6. Machines have isolated configuration and file data, and supported machine data can be exported and validated on import.

## Phases completed in this update

- **Foundation:** Replaced the previous single-surface entry point with the WebOS manager while retaining the AUGMENT research surface as a desktop app.
- **Desktop engine:** Added reusable laptop, screen, chassis, boot, toolbar, desktop, window, taskbar, Dock, launcher, context-menu, and app-registry components.
- **Virtual filesystem:** Added safe virtual paths, directories, files, trash/restore, copy/move, search, metadata, quotas, export/import, IndexedDB persistence, and temporary mode.
- **Applications:** Added functional file management, terminal commands, text editing, calculator, safe internal browser, notes, calendar, monitor, settings, store, and research workspace.
- **Advanced mode boundary:** Documented the emulator boundary in the manager. No real guest OS image is bundled or mislabeled as a native Windows/macOS/Linux installation.
- **Official media workflow:** Added vendor links for Microsoft Windows 11 ISO/MCT and Apple macOS installer guidance, plus session-only staging of user-selected ISO/DMG/IMG media metadata. The browser never uploads, executes, or claims to boot those files.

## Verification targets

- `npm run build` must pass TypeScript and the Vite production build.
- `npm run lint` must complete; current warnings are React Fast Refresh/purity guidance and do not block the build.
- Manual smoke flow: launch each OS, skip or complete boot, open File Manager and Terminal, create/edit a file, restart, shut down, and create a second machine.

## Browser limitations

- This is a browser-native simulation, not a kernel or hardware virtual machine.
- Terminal commands are implemented against WebOS's virtual filesystem and never execute host shell commands.
- External websites are not iframe-proxied. The internal browser shows a policy explanation and opens external destinations in a normal browser tab.
- Persistent local storage depends on browser storage availability and quota. Temporary cleanup is best-effort on normal shutdown; force-quit/crash cleanup cannot be guaranteed.
- Real emulation remains an optional future mode requiring a compatible, legally supplied disk image and separate performance/accessibility work.
- Microsoft’s Media Creation Tool is a Windows x64 executable and cannot run in this macOS browser workspace. Apple’s current macOS installer workflow produces an installer app; official DMG downloads are limited to older releases. Use a licensed native VM product or compatible physical Apple hardware for genuine guests.
