package com.back.backend.services;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.back.backend.Entities.Poste;
import com.back.backend.Entities.PosteFiles;
import com.back.backend.Entities.PosteLikes;
import com.back.backend.repositories.PosteFilesRepository;
import com.back.backend.repositories.PosteLikesRepository;
import com.back.backend.repositories.PosteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
// this class will serve foor common things between the users 
public class UserService {
private final PosteRepository posteRepository;
private final PosteLikesRepository posteLikesRepository;
private final PosteFilesRepository posteFilesRepository;


 // creation de postes par un laureat => 2 type de possible NORMAL ET CAUMMUNAUTE
    public ResponseEntity<String> createPoste(String posteJson, MultipartFile file) throws JsonMappingException, JsonProcessingException {
    Poste poste = new ObjectMapper().readValue(posteJson, Poste.class);
    poste.setDatePoste(LocalDateTime.now());
    poste.setNbrLikes(0);
    this.posteRepository.save(poste);

    if (!file.isEmpty()) {
        try {
            PosteFiles posteFiles = new PosteFiles();
            posteFiles.setFileName(file.getOriginalFilename());
            posteFiles.setFileType(file.getContentType());
            posteFiles.setData(file.getBytes());
            posteFiles.setPoste(poste);
            this.posteFilesRepository.save(posteFiles);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed");
        }
    }
    return ResponseEntity.ok("Poste ajouté avec succes");
}




    public ResponseEntity<String> likePoste(int idPoste , int idUser){
        Poste poste = this.posteRepository.findById(idPoste).orElse(null);
        // check if the user already liked the poste if yes he cant like it again 
        PosteLikes posteLikes = this.posteLikesRepository.checklikes(idUser, idPoste) ; 
        if(poste != null && posteLikes == null){
            poste.setNbrLikes(poste.getNbrLikes()+1);
            this.posteRepository.save(poste);
            PosteLikes newPosteLikes = PosteLikes.builder()
                                    .posteId(idPoste)
                                    .userId(idUser)
                                    .build() ;  
            this.posteLikesRepository.save(newPosteLikes) ; 
            return ResponseEntity.ok("Poste liké avec succes");
            }
            return ResponseEntity.badRequest().body("Poste non trouvé et le poste est deja like par cet utilisateur");
    }

    public ResponseEntity<String> unlikePoste(int posteId , int userId){
        Poste poste = this.posteRepository.findById(posteId).orElse(null);
        PosteLikes likedPosteCheck = this.posteLikesRepository.checklikes(userId , posteId) ; 
        if(poste != null && likedPosteCheck != null){
            poste.setNbrLikes(poste.getNbrLikes()-1);
            this.posteRepository.save(poste);
            this.posteLikesRepository.delete(likedPosteCheck) ; 
            return ResponseEntity.ok("Poste unliké avec succes");
            }
            return ResponseEntity.badRequest().body("Poste non trouvé et le poste n'est pas like par cet utilisateur");
    }
}
