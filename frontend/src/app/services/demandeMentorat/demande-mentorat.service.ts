import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class DemandeMentoratService {

  
  private apiUrl = 'test.json';  // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer les demandes de mentorat
  getDemandes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

    // Méthode pour accepter une demande
    accepterDemande(id: number): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, { statusMentorat: 1 });
    }
  
    // Méthode pour refuser une demande
    refuserDemande(id: number): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, { statusMentorat: -1 });
    }
}
