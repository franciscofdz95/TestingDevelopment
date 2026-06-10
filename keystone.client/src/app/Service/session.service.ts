import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'myapp.currentBranch';
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly baseUrl = environment.apiUrl;

  private readonly _currentBranch = new BehaviorSubject<string | null>(null);
  /** Observable para plantillas y reactivo en componentes */
  readonly currentBranch$: Observable<string | null> = this._currentBranch.asObservable();

  constructor(private http: HttpClient) {

    // Inicializa desde sessionStorage si existe
    const saved = sessionStorage.getItem(STORAGE_KEY);
    this._currentBranch.next(saved || null);

    // (Opcional) Sincroniza cambios entre pestañas de la misma sesión
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.storageArea === sessionStorage && e.key === STORAGE_KEY) {
        this._currentBranch.next(e.newValue ?? null);
      }
    });

  }

  getUserIDByUsername(userName: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/api/Session/GetUserIDByUserName?userName=${userName}`);
  }

  /** Lectura síncrona (para lógica en TS) */
  get currentBranch(): string | null {
    return this._currentBranch.value;
  }

  /** Escritura + persistencia en sessionStorage */
  setCurrentBranch(branch: string | null): void {
    this._currentBranch.next(branch);
    if (branch == null) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, branch);
    }
  }

  /** Limpia al cerrar sesión */
  clear(): void {
    this._currentBranch.next(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }


}
