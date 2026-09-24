# 📋 Spécifications du Portfolio — Louis Ghiglione

## Informations générales

| Champ | Valeur |
|---|---|
| **Nom** | Louis Ghiglione |
| **GitHub** | louis289 |
| **Repo** | `portfolio-louis-ghiglione` |
| **URL GitHub Pages** | https://louis289.github.io/portfolio-louis-ghiglione/ |
| **Cours** | CAM L3 FISA – Semester 5 – Module 1 – Marketing 4 Careers |
| **Deadline** | Jeudi 3 décembre 2026, 18h00 (sur Moodle) |

---

## 🚫 Non-négociables (extrait PDF `CAM_L3_FISA_S5_EVALUATION.pdf`)

> Ces points sont éliminatoires ou fortement pénalisés.

- **6 onglets obligatoires** et tous avec du vrai contenu (un onglet vide est sanctionné)
  1. Welcome
  2. Projects
  3. Career
  4. Mobility
  5. Passions
  6. Civic Engagement
- **Onglet Career** — contient impérativement :
  - Une vraie offre d'emploi ciblée
  - CV **et** lettre de motivation adaptés (en anglais ET en français)
  - Profil LinkedIn à jour (poste actuel = apprenti)
  - 2 interviews My Job Glasses® rédigées (qui, pourquoi, ce que j'ai appris) — hors famille, maître d'apprentissage et équipe directe
- **Pitch vidéo** : 3 min (±30 s), en anglais, parlé naturellement — un pitch lu ou récité = **0/20**
- **Pas de texte placeholder** ni de traduction machine non relue
- **Tous les liens doivent fonctionner** depuis un autre appareil avant le dépôt
- **Dépôt sur Moodle** avant le 3 décembre 2026 à 18h00
- Personnalisation obligatoire : tes photos, tes projets, ton entreprise — pas un template intact

### 📊 Grille de progression (4 niveaux)
| Niveau | Critère |
|---|---|
| **Present** | 6 onglets en ligne, tous les liens fonctionnent |
| **Personal** | Tes photos, ta voix, ton entreprise nommée |
| **Concrete** | Noms, dates, résultats — pas d'adjectifs vagues ; vraie offre d'emploi |
| **Coherent** | Un seul UVP cohérent dans CV, lettre, LinkedIn et pitch |

---

## ⚙️ Technique

### Stack
- **Langage** : HTML + CSS + JS vanilla (pas de framework)
- **Hébergement** : GitHub Pages (branche `main`, dossier `/`)
- **Repo local** : `/home/n7student/Documents/PortfolioINP/`
- **Serveur local** : `python3 -m http.server 3000` → http://localhost:3000

### Authentification Git
- **Méthode** : Token GitHub (PAT) intégré dans l'URL remote
- **Remote** : `https://louis289:<TOKEN>@github.com/louis289/portfolio-louis-ghiglione.git`
- ⚠️ Ne jamais commiter le token dans un fichier

### Workflow de mise à jour
```bash
# Depuis /home/n7student/Documents/PortfolioINP/
git add .
git commit -m "description du changement"
git push origin main
# GitHub Pages met ~1 min à se mettre à jour
```

### Fichiers du projet
```
PortfolioINP/
├── index.html           ← page principale (6 onglets)
├── SPECIFICATIONS.md    ← ce fichier
├── README.md
└── CAM_L3_FISA_S5_EVALUATION.pdf  ← sujet du cours
```

---

## 🎨 Esthétique

### Identité visuelle
- **Style** : Dark mode · Glassmorphism · Design premium
- **Ambiance** : Moderne, épuré, tech — donne envie de scroller

### Palette de couleurs
| Variable | Valeur | Usage |
|---|---|---|
| `--bg` | `#080b14` | Fond principal |
| `--surface` | `#0f1322` | Fond secondaire |
| `--accent` | `#6d4aff` | Violet — CTA, titres |
| `--accent2` | `#00d4ff` | Cyan — badges, highlights |
| `--text` | `#f0f4ff` | Texte principal |
| `--muted` | `#7a85a3` | Texte secondaire |

### Typographie
- **Police** : [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)
- **Poids utilisés** : 300 · 400 · 500 · 600 · 800

### Composants UI
- **Background** : Blobs animés avec `filter: blur(90px)` et animation `drift`
- **Cards** : `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(255,255,255,0.08)` + hover lift
- **Nav** : Fixed, `backdrop-filter: blur(20px)`, tabs JS sans rechargement de page
- **Badges** : Pills cyan semi-transparents
- **Titres** : Gradient `linear-gradient(135deg, #fff, var(--accent2))` en `background-clip: text`
- **Transitions** : `0.2s–0.25s ease`, animations `fadeIn` au changement d'onglet

### À définir avec Louis
- [ ] Photo de profil → à fournir
- [ ] Couleurs / style à ajuster selon préférences ?
- [ ] Sections et contenu réels (remplis onglet par onglet)

---

## ✅ Checklist globale

### Technique
- [x] Repo GitHub créé (`portfolio-louis-ghiglione`)
- [x] Git initialisé en local
- [x] Token GitHub configuré
- [x] Premier push réussi
- [x] GitHub Pages activé
- [x] Serveur local configuré (`python3 -m http.server 3000`)

### Contenu (à compléter)
- [ ] Welcome : photo réelle + bio + UVP
- [ ] Projects : vrais projets N7 + apprentissage
- [ ] Career : offre d'emploi + CV + lettre + LinkedIn + 2× MyJobGlasses
- [ ] Mobility : 3 destinations concrètes
- [ ] Passions : contenu personnel
- [ ] Civic : engagements associatifs + heures
- [ ] Pitch vidéo enregistrée et intégrée

### Avant le 3 décembre
- [ ] Tous les liens testés depuis un autre appareil
- [ ] Pas de placeholder text ni traduction machine
- [ ] Dépôt sur Moodle avant 18h00
