import { ProfileService } from './../../services/profile/profile.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../../services/post/post.service';
import { Router, RouterLink } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';



interface Post {
  id: number;
  title: string;
  description: string;
  fichiers:[];
  isLiked:boolean;
}


@Component({
  selector: 'app-myprofile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    RouterLink,
    NavBarComponent
  ],
  templateUrl: './myprofile.component.html',
  styleUrl: './myprofile.component.css'
})


export class MyprofileComponent implements OnInit {


  
   private router =inject(Router);
  form: FormGroup;
 postForm: FormGroup;
  posts:any=[];
  me:any;
  classifiedPosts: any[] = [];

  
  ngOnInit(): void {

    console.log("hi");
    this.postService.getMesPosts().subscribe((data) => {
      this.posts = data;
      this.fetchPosts();

    });

    this.me = JSON.parse(localStorage.getItem('user') || '{}');

    if (this.me.role === 'etudiant') {
              this.form.patchValue({
                firstname: this.me.firstname,
                lastname: this.me.lastname,
                filiere: this.me.filiere || '', // Par défaut si non défini
              });
            }
        
            if (this.me.role === 'laureat') {
              this.form.patchValue({
                firstname: this.me.firstname,
                lastname: this.me.lastname,
                specialite: this.me.specialite || '', // Par défaut si non défini
                entreprise: this.me.entreprise || '', // Par défaut si non défini
              });
            }
  }



  fetchPosts(): void {
    this.classifiedPosts = this.posts.map((post: Post) => ({
      ...post,
      images: post.fichiers.filter((url: string) => this.isImage(url)),
      pdfs: post.fichiers.filter((url: string) => this.isPdf(url))
    }));
  }
  

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isPdf(url: string): boolean {
    return /\.pdf$/i.test(url);
  }

  constructor(private fb: FormBuilder,private postService: PostService, private ProfileService: ProfileService) {


    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      filiere: ['', Validators.required],
      entreprise: ['',Validators.required],
      image: ['',Validators.required],
      specialite:['',Validators.required],

    });

    this.postForm = this.fb.group({
      description: [''],
      fichiers: [[]],
    
    });
  }

 
  submitPost(): void {
    if (this.postForm.valid) {
      const postData = this.postForm.value;
  
      // Créer un FormData pour envoyer les fichiers
      const formData = new FormData();
  
      // Ajoutez la description du post (optionnel)
      formData.append('description', postData.description || '');
  
      // Ajoutez chaque fichier à l'objet FormData
      this.selectedFiles.forEach((file) => {
        formData.append('files', file, file.name); // 'files' est le champ attendu par le backend
      });
  
     
  
      // Appeler le service pour envoyer les données
      this.postService.createPost(formData).subscribe((response) => {
        this.posts.unshift(response); 
        this.postForm.reset();
        this.selectedFiles = [];
        this.selectedFileNames = [];
      });
    }
  }
  

  selectedFiles: File[] = [];
    selectedFileNames: string[] = [];
    
    onFileChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file) => {
          const mimeType = file.type;
    
          if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
            this.selectedFiles.push(file);  // Ajoute les fichiers valides à la liste
            this.selectedFileNames.push(file.name); // Ajoute le nom du fichier
          } else {
            console.error('Type de fichier non pris en charge :', file.name);
          }
        });
    
        console.log('Fichiers sélectionnés :', this.selectedFiles);
      }
    }
  
  selectedImages: string[] = []; // Images sélectionnées pour la galerie
isGalleryOpen: boolean = false; // Initialement fermé
openGallery(images: string[]): void {
  this.selectedImages = images; // Stocke les images restantes
  console.log('Opening gallery with images:', images);
  // Ajoutez ici la logique pour ouvrir un modal ou une galerie
  this.isGalleryOpen = true; // Exemple : activer un état pour afficher un modal
}

closeGallery(): void {
  this.isGalleryOpen = false;
}



selectedImage: string | null = null;

openModalimage(image: string) {
  this.selectedImage = image;
}

closeModalimage() {
  this.selectedImage = null;
}
  

toggleLike(post: any): void {
  const userId = 'myCIN'; 
  const isLiked = !post.isLiked;

    this.postService.toggleLike(post.id, isLiked).subscribe(
    (response) => {
      if (response.success) {
   
        post.isLiked = isLiked;
        console.log(`Action "isLiked=${isLiked}" réussie pour le post :`, post);
      } else {
        console.error('Erreur lors de la mise à jour du like.');
      }
    },
    (error) => {
      console.error('Erreur de communication avec le backend :', error);
    }
  );


}
  


updateProfile(event: Event): void {
  event.preventDefault();
  if (this.form.valid) {
    const updatedProfile = { ...this.form.value }; // Obtenir toutes les données du formulaire
    
 

    console.log('Profil mis à jour:', updatedProfile);

    // Appeler le service pour envoyer les données au backend
    this.ProfileService.updateProfile(updatedProfile).subscribe(
      (response) => {
        console.log('Profil mis à jour avec succès:', response);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
      }
    );
  } else {
    console.error('Formulaire invalide');
  }
}

    
    // updateImage(event: Event): void {
    //   event.preventDefault();
    //   const image = this.form.get('image')?.value;
    //   if (image) {
    //     this.ProfileService.updateProfile(updatedProfile).subscribe(
    //       (response) => {
    //         console.log('Profil mis à jour avec succès:', response);
    //       },
    //       (error) => {
    //         console.error('Erreur lors de la mise à jour du profil:', error);
    //       }
    //     );
    //     console.log('Image mise à jour:', image);
       
    //   } else {
    //     console.error('Aucune image sélectionnée');
    //   }
    // }



       visibleLists: { [key: number]: boolean } = {};

  toggleList(index: number): void {
    // Inverse l'état de visibilité de la liste pour un post donné
    this.visibleLists[index] = !this.visibleLists[index];
  }


selectFile(): void {
  const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
  fileInput?.click(); // Simule un clic pour ouvrir le sélecteur de fichier
}

onImageSelected(event: any): void {
  const file = event.target.files[0]; // Récupère le fichier sélectionné
  if (file) {
    this.form.patchValue({image:file}) // Stocke l'image dans la variable imageFile
  }
}


isModalOpen = false; 
  openModal(): void {
    this.isModalOpen = true;
  }


  closeModal(): void {
    this.isModalOpen = false;
  }



  isEditing: boolean = false; 
  editingPost: any; 
  
  editPost(post: { description: string; fichiers: string[]; }): void {
    this.isEditing = true;
    this.editingPost = { ...post }; 
  }
  
  closeEdit(): void {
    this.isEditing = false;
    this.editingPost = { description: '', fichiers: [], id: null }; // ou undefined si vous préférez
  }

  updatePost() {
    this.postService.updatePost(this.editingPost).subscribe({
      next: (response) => {
        console.log('Post updated successfully:', response);
        // Rediriger ou afficher un message de succès
        //this.closeEdit();
        this.router.navigate(['/posts']); // Exemple de redirection après succès
      },
      error: (error) => {
        console.error('Error updating post:', error);
        // Afficher un message d'erreur si nécessaire
      }
    });
  }


  //   removeImage(index: number): void {
  //   this.editingPost.images.splice(index, 1);
  // }
  
  // removePdf(index: number): void {
  //   this.editingPost.pdfs.splice(index, 1);
  // }


  isImageOpen: boolean = false;

openImage() {
  this.isImageOpen = true;
}

closeImage() {
  this.isImageOpen = false;
}


//parti commenbter




//     posts = [
//     {
//       profileImage: 'profile.png',
//       username: 'Mouad Ajmani',
//       role: '1337 student',
//       daysAgo: 4,
//       description: "🌟 Excited to Share My Portfolio! 🌟 I'm thrilled to unveil the first version of my personal portfolio website! 🎉",
//       images: ['windows-design.jpg'], // Tableau contenant les chemins des images
//       pdfs: [], // Tableau vide si aucun PDF n'est attaché
//       likes: 891,
//       likeIcon: 'like.png',
//       isLiked: false
//     },
//     {
//       profileImage: 'profile.png',
//       username: 'Mouad Ajmani',
//       role: '1337 student',
//       daysAgo: 4,
//       description: "🌟 Excited to Share My Portfolio! 🌟 I'm thrilled to unveil the first version of my personal portfolio website! 🎉",
//       images: ['laravel.png','profile.png'], // Tableau contenant les chemins des images
//       pdfs: ['projet_use_case.pdf'], // Tableau contenant les chemins des fichiers PDF
//       likes: 891,
//       likeIcon: 'like.png',
//       isLiked: false
//     },
//     {
//       profileImage: 'profile.png',
//       username: 'Mouad Ajmani',
//       role: '1337 student',
//       daysAgo: 4,
//       description: "🌟 Excited to Share My Portfolio! 🌟 I'm thrilled to unveil the first version of my personal portfolio website! 🎉",
//       images: ['laravel.png','profile.png','profile.png'], // Tableau contenant les chemins des images
//       pdfs: ['projet_use_case.pdf'], // Tableau contenant les chemins des fichiers PDF
//       likes: 891,
//       likeIcon: 'like.png',
//       isLiked: false
//     },
//     {
//       profileImage: 'profile.png',
//       username: 'Mouad Ajmani',
//       role: '1337 student',
//       daysAgo: 4,
//       description: "🌟 Excited to Share My Portfolio! 🌟 I'm thrilled to unveil the first version of my personal portfolio website! 🎉",
//       images: ['laravel.png','profile.png','profile.png','profile.png','profile.png'], // Tableau contenant les chemins des images
//       pdfs: ['projet_use_case.pdf'], // Tableau contenant les chemins des fichiers PDF
//       likes: 891,
//       likeIcon: 'like.png',
//       isLiked: false
//     }
    
    
//   ];
  

//   isLiked: boolean = false; 
 

 

//   postForm: FormGroup;
//   form: FormGroup;


//   //constructor(private fb: FormBuilder) {
//     constructor(private fb: FormBuilder) {
//     this.postForm = this.fb.group({
//       description: [''], 
//       images: [null],  
//       files: [null]   
//     });


//     this.form = this.fb.group({
//       firstname: ['', Validators.required],
//       lastname: ['', Validators.required],
//       filiere: ['', Validators.required],
//       entreprise: [''],
//       image: [''],
//       specialite:['',Validators.required],

//     });




    
//   }

//    me:any;


//   //me={id:'1',firstname:'soumaia',lastname:'kerouan',filiere:"ginf",role:"etudiant"}
//     //me={id:'1',firstname:'Soumaia',lastname:'Kerouan Salah',promotion:"2025",specialite:'developpeur full stack' , entreprise:'KINOV',role:'laureat'}
//     ngOnInit(): void {
//      console.log("hi")
//       this.me = {
//         id: '1',
//         firstname: 'Soumaia',
//         lastname: 'Kerouan Salah',
//         promotion: '2025',
//         specialite: 'developpeur full stack',
//         entreprise: 'KINOV',
//         role: 'laureat',
//       };
  
//         //this.me={id:'1',firstname:'soumaia',lastname:'kerouan',filiere:"ginf",role:"etudiant"};

     
//       if (this.me.role === 'etudiant') {
//         this.form.patchValue({
//           firstname: this.me.firstname,
//           lastname: this.me.lastname,
//           filiere: this.me.filiere || '', // Par défaut si non défini
//         });
//       }
  
//       if (this.me.role === 'laureat') {
//         this.form.patchValue({
//           firstname: this.me.firstname,
//           lastname: this.me.lastname,
//           specialite: this.me.specialite || '', // Par défaut si non défini
//           entreprise: this.me.entreprise || '', // Par défaut si non défini
//         });
//       }
//     }

//   updateProfile(event: Event): void {
//     event.preventDefault();
//     if (this.form.valid) {
//       const updatedProfile = { ...this.form.value, image: null }; // Exclure l'image
//       console.log('Profil mis à jour:', updatedProfile);
//       // Envoyer les données personnelles mises à jour au backend
//     } else {
//       console.error('Formulaire invalide');
//     }
//   }
  
//   updateImage(event: Event): void {
//     event.preventDefault();
//     const image = this.form.get('image')?.value;
//     if (image) {
//       console.log('Image mise à jour:', image);
//       // Envoyer l'image au backend
//     } else {
//       console.error('Aucune image sélectionnée');
//     }
//   }
  
//   submit(event: Event): void {
//     event.preventDefault();
//     if (this.form.valid) {
//       const updatedProfile = this.form.value;
//       console.log('Profil mis à jour:', updatedProfile);
//       // Envoyer les données mises à jour au backend
//     } else {
//       console.error('Formulaire invalide');
//     }
//     this.closeModal();
//   }

//   selectedFiles: File[] = [];
//   selectedFileNames: string[] = [];
  
//   onFileChange(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       // Ne réinitialisez pas les tableaux, mais ajoutez les nouveaux fichiers sélectionnés
//       Array.from(input.files).forEach((file) => {
//         const mimeType = file.type;
  
//         if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
//           this.selectedFiles.push(file);  // Ajoute les fichiers valides à la liste
//           this.selectedFileNames.push(file.name); // Ajoute le nom du fichier
//         } else {
//           console.error('Type de fichier non pris en charge :', file.name);
//         }
//       });
  
//       console.log('Fichiers sélectionnés :', this.selectedFiles);
//     }
//   }
  
//   // Soumission du post
//   submitPost(): void {
//     if (this.postForm.valid) {
//       const postData = this.postForm.value;
//       console.log('Post soumis :', postData);
  
//       // Traitez les fichiers images
//       const images = this.selectedFiles
//         .filter((file) => file.type.startsWith('image/'))
//         .map((file) => URL.createObjectURL(file));  // Crée des URL temporaires pour les images
  
//       // Traitez les fichiers PDF
//       const pdfs = this.selectedFiles
//         .filter((file) => file.type === 'application/pdf')
//         .map((file) => URL.createObjectURL(file));  // Crée des URL temporaires pour les PDF
  
//       const newPost = {
//         profileImage: 'profile.png', // Remplace par le chemin de l'image du profil utilisateur
//         username: 'Soumaia Kerouan', // Remplace par le nom de l'utilisateur connecté
//         role: 'User', // Ajout de la propriété 'role'
//         daysAgo: 0, // Nouveau post, donc publié aujourd'hui
//         description: postData.description || '', // Description vide par défaut si non renseignée
//         images, // Liste des URL temporaires pour les images
//         pdfs,   // Liste des URL temporaires pour les fichiers PDF
//         likes: 0, // Initialisation des likes à 0
//         likeIcon: 'like.png', // Ajout de la propriété 'likeIcon'
//         isLiked: false, // Par défaut, le post n'est pas aimé
//       };
  
//       // Ajouter le nouveau post au début du tableau posts
//       this.posts.unshift(newPost);
  
//       // Réinitialisation du formulaire après soumission
//       this.postForm.reset();
//       this.selectedFiles = []; // Réinitialise la liste des fichiers
//       this.selectedFileNames = []; // Réinitialise les noms des fichiers
//     }
//   }
  
  
//   // Toggle "J'aime" pour un post
//   toggleLike(post: any): void {
//     post.isLiked = !post.isLiked;

 
//   }


//   visibleLists: { [key: number]: boolean } = {};

//   toggleList(index: number): void {
//     // Inverse l'état de visibilité de la liste pour un post donné
//     this.visibleLists[index] = !this.visibleLists[index];
//   }


//   isModalOpen = false; 

 





//   // Ouvrir la modale
//   openModal(): void {
//     this.isModalOpen = true;
//   }

//   // Fermer la modale
//   closeModal(): void {
//     this.isModalOpen = false;
//   }

//   // Sauvegarder les données
//   saveChanges(): void {
//    return this.form.value;
// }

// isImageOpen: boolean = false;

// openImage() {
//   this.isImageOpen = true;
// }

// closeImage() {
//   this.isImageOpen = false;
// }


// selectFile(): void {
//   const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
//   fileInput?.click(); // Simule un clic pour ouvrir le sélecteur de fichier
// }

// imageFile: File | null = null;

  
// onImageSelected(event: any): void {
//   const file = event.target.files[0]; // Récupère le fichier sélectionné
//   if (file) {
//     this.form.patchValue({image:file}) // Stocke l'image dans la variable imageFile
//   }
// }

// isModalUpdateposte=false;
// closeModalUpdateposte(){
//   this.isModalUpdateposte=!this.isModalUpdateposte;
// }

// selectedImage: string | null = null;


//   openModalimage(image: string) {
//     this.selectedImage = image;
//   }

//   closeModalimage() {
//     this.selectedImage = null;
//   }

//   selectedImages: string[] = []; // Images sélectionnées pour la galerie
// isGalleryOpen: boolean = false; // Initialement fermé
// openGallery(images: string[]): void {
//   this.selectedImages = images; // Stocke les images restantes
//   console.log('Opening gallery with images:', images);
//   // Ajoutez ici la logique pour ouvrir un modal ou une galerie
//   this.isGalleryOpen = true; // Exemple : activer un état pour afficher un modal
// }

// closeGallery(): void {
//   this.isGalleryOpen = false;
// }



// //modifier poste





//   isEditing: boolean = false; 
//   editingPost: { description: string; images: string[]; pdfs: string[] } = {
//     description: '',
//     images: [],
//     pdfs: []
//   }; 
  
//   editPost(post: { description: string; images: string[]; pdfs: string[] }): void {
//     this.isEditing = true;
//     this.editingPost = { ...post }; // Crée une copie du post pour modification
//   }
  
//   closeEdit(): void {
//     this.isEditing = false;
//     this.editingPost = {
//       description: '', // Texte vide par défaut
//       images: [], // Liste d'images vide
//       pdfs: [] // Liste de PDF vide
//     };
//   }
  
//   removeImage(index: number): void {
//     this.editingPost.images.splice(index, 1);
//   }
  
//   removePdf(index: number): void {
//     this.editingPost.pdfs.splice(index, 1);
//   }
  
//   updatePost(): void {
//     const updatedPost = {
//       description: this.editingPost.description,
//       images: this.editingPost.images.length ? this.editingPost.images : null, // Vérifie si des images restent
//       pdfs: this.editingPost.pdfs.length ? this.editingPost.pdfs : null // Vérifie si des PDF restent
//     };
  
//     console.log('Post mis à jour :', updatedPost);
  
  
//     this.closeEdit(); 
//   }



 
  }