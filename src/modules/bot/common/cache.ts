import { InputFile } from 'grammy';
import { Message } from 'grammy/types';

class Cache {
  constructor() {
    this._cache = new Map();
  }
  private _cache: Map<string, any>;
  //TODO: remove hardcoded language
  private _assets: { [key: string]: string } = {
    oferta_ru: 'dist/public/assets/oferta_ru.pdf',
    oferta_uz: 'dist/public/assets/oferta_uz.pdf',
    start: 'dist/public/assets/start.png',
    phone: 'dist/public/assets/phone.png',
    menu: 'dist/public/assets/menu.png',
    about: 'dist/public/assets/about.png',
    // parCheck_ru: 'dist/public/assets/parCheck_ru.png',
    // parCheck_kz: 'dist/public/assets/parCheck_kz.png',
    // parBarcode_ru: 'dist/public/assets/parBarcode_ru.png',
    // parBarcode_kz: 'dist/public/assets/parBarcode_kz.png',
    // contacts_ru: 'dist/public/assets/contacts_ru.png',
    // contacts_kz: 'dist/public/assets/contacts_kz.png',
  };
  public resolveAsset(name: string): string | InputFile {
    if (this._cache.has(name)) return this._cache.get(name);
    if (name in this._assets) {
      return new InputFile(this._assets[name]);
    }
  }
  public resolveImage(localPath: string): string | InputFile {
    if (this._cache.has(localPath)) return this._cache.get(localPath);
    return new InputFile(`dist/public/${localPath}`);
  }
  public cacheAsset(name: string, msg: Message.PhotoMessage | Message.DocumentMessage | Message.VideoMessage): void {
    if (this._cache.has(name)) return;
    if ('photo' in msg) {
      this._cache.set(name, msg.photo[0].file_id);
    } else if ('document' in msg) {
      this._cache.set(name, msg.document.file_id);
    } else if ('video' in msg) {
      this._cache.set(name, msg.video.file_id);
    }
  }
}

export default new Cache();
