# Portfolio Template Generator

Bienvenue sur ce template de Portfolio modulaire et "Data-Driven" ! 
Ce projet a été conçu pour que n'importe quel étudiant de la promotion (ou d'ailleurs) puisse avoir un portfolio moderne, bilingue, et hautement personnalisable **sans avoir à toucher au code HTML ou CSS**.

**TOUT** le contenu de votre portfolio est piloté par un seul fichier : `data/translations.json`.

---

## 🚀 Comment l'utiliser ? (Quickstart)

### 1. Structure des dossiers à respecter
Ne touchez pas aux fichiers `.html`, `.css`, ni `.js`. Placez simplement vos ressources dans les bons dossiers :

- **`/images/`** : Placez ici votre photo de profil, les logos de vos écoles/entreprises, et les photos illustrant vos projets et passions.
- **`/assets/`** : Placez ici vos CV en PDF (FR et EN) ainsi que votre Portfolio global en PDF (utilisé si la navigation plante pour un recruteur).
- **`/data/`** : Contient `translations.json`, le **CŒUR** de votre site.

### 2. Configurer le `translations.json`
Ouvrez `data/translations.json`. Il est divisé en deux grandes parties : `"en"` (Anglais) et `"fr"` (Français).

Dans chaque langue, vous trouverez une section `"config"` :
```json
"config": {
  "name": "Votre Prénom Nom",
  "avatar_url": "./images/votre-photo.jpg",
  "email_mailto": "mailto:votre.mail@ecole.fr",
  "email_display": "votre.mail@ecole.fr",
  "linkedin_url": "https://www.linkedin.com/in/votre-profil/",
  "linkedin_display": "linkedin.com/in/votre-profil",
  "cv_url": "./assets/Mon_CV_FR.pdf",
  "portfolio_pdf_url": "./assets/Mon_Portfolio_Complet.pdf",
  "school_logo_url": "./images/logo_ecole.png",
  "school_link": "https://site-de-votre-ecole.fr",
  "company_logo_url": "./images/logo_entreprise.png",
  "company_link": "https://site-de-votre-entreprise.fr"
}
```
Remplissez **impérativement** ces champs dans les deux langues (vous pouvez utiliser des liens de CV différents pour `en` et `fr`). Le site mettra automatiquement à jour votre nom, les logos dans la barre de navigation, la page contact et les boutons de téléchargement de CV.

### 3. Remplir le contenu (Expériences, Projets, Passions)
Toujours dans `translations.json`, descendez dans les sections correspondantes :
- `"welcome"` : Votre texte d'introduction (Who am I), votre UVP.
- `"projects"` : Vos projets (cartes + contenu de la modale).
- `"career"` : Votre parcours professionnel.
- `"mobility"` : Vos expériences à l'international.
- `"passions"` / `"civic"` : Vos engagements.

**Pour les cartes de projets (`projects`, `civic`) :**
Le HTML contient des filtres (En cours / Passé). Pour que cela fonctionne, les cartes dans le code source ont un attribut `data-status`. Actuellement, les 4 projets sont hardcodés avec ces attributs dans `projects.html` et `civic.html`. *Si vous ajoutez ou supprimez des projets, il faudra copier-coller les balises `<li class="card">` dans le HTML.*

### 4. La vidéo Pitch
Dans la section `"welcome"`, la clé `"pitch_placeholder"` vous permet d'intégrer une iframe Youtube. Remplacez le texte par le code d'intégration de votre vidéo :
```json
"pitch_placeholder": "<iframe width=\"100%\" height=\"315\" src=\"https://www.youtube.com/embed/votre_id\" frameborder=\"0\" allowfullscreen></iframe>"
```
*(N'oubliez pas d'échapper les guillemets avec un backslash `\"` comme dans l'exemple ci-dessus).*

---

## 🛠 Fonctionnalités techniques intégrées

1. **Glow & Glassmorphism** : Thème sombre moderne (cyan/violet).
2. **Circuit Canvas** : Arrière-plan animé génératif.
3. **Data Binding** : Le JS (`i18n.js`) scanne les balises contenant `data-bind="href:config.cv_url; src:config.avatar_url"` et injecte dynamiquement les valeurs du JSON.
4. **Fallback Navigation (Anti-Crash)** : Si le site est ouvert en local sans serveur web (double-clic `file:///`), le chargement de la navigation échouera par sécurité (CORS). Une fenêtre popup ("Fallback") apparaîtra alors automatiquement pour proposer au recruteur de télécharger directement votre Portfolio PDF global !

## ⚡️ Déploiement & Hébergement

### 0. Cloner / Copier ce Template
Pour créer votre propre portfolio, commencez par faire une copie de ce dépôt GitHub. 
👉 **Dépôt originel à cloner :** [https://github.com/louis289/portfolio-louis-ghiglione.git](https://github.com/louis289/portfolio-louis-ghiglione.git)

Vous pouvez :
- Le "Fork" directement sur GitHub.
- Ou télécharger le `.zip` et l'extraire sur votre machine.

### Méthode 1 : GitHub Pages (Le plus simple et gratuit)
C'est la méthode recommandée.
1. Créez un dépôt sur GitHub (ex: `mon-portfolio`).
2. Poussez (push) les fichiers de ce template sur votre dépôt.
3. Sur la page de votre dépôt sur GitHub, allez dans **Settings** (Paramètres).
4. Dans le menu de gauche, cliquez sur **Pages**.
5. Sous *Build and deployment*, dans la section *Source*, sélectionnez **Deploy from a branch**.
6. Sous *Branch*, choisissez `main` (ou `master`), laissez le dossier sur `/ (root)` et cliquez sur **Save**.
7. Patientez quelques minutes. Votre portfolio sera accessible à l'adresse : `https://<votre-pseudo>.github.io/<nom-du-repo>/`.

### Méthode 2 : Serveur VPS (Avancé)
Si vous possédez un serveur VPS (OVH, Hostinger, AWS, etc.) et que vous voulez utiliser votre propre nom de domaine :
1. Connectez-vous à votre VPS en SSH.
2. Assurez-vous d'avoir un serveur web d'installé (comme Nginx ou Apache).
3. Clonez votre dépôt dans le répertoire web (généralement `/var/www/html`) :
   ```bash
   git clone https://github.com/VOTRE_PSEUDO/VOTRE_REPO.git /var/www/mon-portfolio
   ```
4. Configurez votre Server Block Nginx (ou Virtual Host Apache) pour pointer vers ce dossier.
5. (Optionnel mais recommandé) Sécurisez votre site avec HTTPS via Certbot (Let's Encrypt).
