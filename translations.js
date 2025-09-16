// Multi-language translations for The Dark Creed Alliance Scheduler
const translations = {
  en: {
    // Header
    title: "The Dark Creed Alliance",
    subtitle: "Unite. Strategize. Dominate.",
    logout: "Logout",
    
    // Timezone Modal
    timezoneTitle: "🌍 Confirm Your Timezone",
    timezoneDescription: "We've detected your timezone automatically. Please confirm it's correct before proceeding:",
    detectedInfo: "📍 Detected Information",
    yourLocalTime: "Your Local Time",
    serverTime: "Server Time",
    timezoneImportant: "Important: Your time slot selections will be converted to server time (UTC-2) for coordination.",
    confirmContinue: "✅ Confirm & Continue",
    changeTimezone: "🔄 Change Timezone",
    
    // Authentication
    authRequired: "Authentication Required",
    notAuthenticated: "Not authenticated",
    authenticated: "Authenticated",
    githubTokenPlaceholder: "GitHub Token (required for all members)",
    authenticate: "Authenticate",
    authDescription: "All members must authenticate before submitting information.",
    contactR4R5: "Contact your alliance R4/R5 for the GitHub token.",
    
    // Form Section
    submitInfo: "Submit Your Information",
    howUpdatesWork: "💡 How Updates Work",
    quickUpdate: "Quick Update: Enter your username + new car power and/or tower level → your time slots stay the same",
    fullUpdate: "Full Update: Enter your username + select new time slots → update everything (car power/tower optional)",
    newMembersNote: "New members must fill all fields including time slots",
    
    // Timezone Status
    timezoneConfirmed: "✅ Timezone Confirmed",
    timezoneSetupRequired: "🔒 Timezone Setup Required",
    confirmTimezoneFirst: "Please confirm your timezone first to enable time slot selection.",
    usingTimezone: "Using {timezone} timezone",
    
    // Form Fields
    inGameUsername: "In-Game Username",
    usernamePlaceholder: "Your username",
    mainCarPower: "Main Car Power",
    carPowerPlaceholder: "e.g., 150000",
    towerLevel: "Tower Level",
    towerLevelPlaceholder: "1-33",
    timezone: "Timezone",
    
    // Time Slots
    availableTimeSlots: "Available Time Slots",
    timeSlotDescription: "Select when you're usually available (2-hour blocks in your local time)",
    submitInformation: "Submit Information",
    
    // Days of the week
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    
    // Timeline
    allianceTimeline: "Alliance Timeline (Server Time UTC-2)",
    memberAvailabilityScale: "Member availability scale (times converted to server time UTC-2):",
    critical: "Critical",
    low: "Low",
    moderate: "Moderate",
    good: "Good",
    excellent: "Excellent",
    
    // Alliance Members
    allianceMembers: "Alliance Members",
    power: "Power",
    tower: "Tower",
    language: "Language",
    
    // Tab Navigation
    submitInfoTab: "Submit Info",
    registrationFormTab: "Registration Form",
    registrationForm: "Registration Form",
    viewAllianceTab: "View Alliance",
    
    // Registration Form
    registrationRequirements: "📋 Registration Requirements",
    vsEventRequirement: "VS Event Requirement:",
    vsEventDescription: "TDC requires at least 1M points daily during VS weekly events",
    completeAllFields: "Please complete all fields below to submit your application",
    regInGameUsername: "In-Game Username *",
    regUsernamePlaceholder: "Your in-game username",
    regMainCarPower: "Main Car Power *",
    regCarPowerPlaceholder: "e.g., 2500000",
    regTowerLevel: "Tower Level *",
    regTowerLevelPlaceholder: "1-33",
    regDailyPoints: "Daily VS Event Points (Average) *",
    regDailyPointsPlaceholder: "e.g., 1200000",
    regExAlliances: "Previous Alliances",
    regExAlliancesPlaceholder: "List your previous alliances (or write 'None' if this is your first)",
    regWhyLeft: "Why did you leave your previous alliances?",
    regWhyLeftPlaceholder: "Explain your reasons for leaving previous alliances",
    regWhyJoin: "Why do you want to join TDC? *",
    regWhyJoinPlaceholder: "Tell us why you want to join The Dark Creed and what motivates you",
    regMotivation: "What motivates you to play and excel? *",
    regMotivationPlaceholder: "Share what drives you to succeed in the game",
    submitRegistration: "Submit Registration Application",
    adminSection: "🔒 Administration Section",
    viewPendingApplications: "View Pending Applications",
    pendingApplications: "Pending Applications",
    
    // Fields for member cards
    carPower: "car power",
    towerLevel: "tower level",
    
    // Messages
    authenticationSuccessful: "Authentication successful!",
    languageChanged: "Language changed successfully!",
    enterGithubToken: "Please enter a GitHub token",
    enterUsername: "Please enter a username",
    updateRequiresAtLeastOneField: "Please enter either car power or tower level to update",
    mustAuthenticate: "You must authenticate with a GitHub token before submitting your information!",
    confirmTimezoneBeforeSubmit: "Please confirm your timezone before submitting your information!",
    fillAllFields: "Please fill all required fields",
    newMemberRequirements: "New members must provide car power and tower level",
    memberInfoSubmitted: "Member information submitted successfully!",
    memberInfoUpdated: "{username}'s information has been updated!",
    memberInfoFullyUpdated: "{username}'s information has been fully updated!",
    confirmTimezoneBeforeSelect: "Please confirm your timezone first!",
    enterR5Password: "Enter the R5 password to delete this member:",
    incorrectPassword: "Incorrect password. Member not deleted.",
    memberRemoved: "{memberName} has been removed from the alliance",
    mustAuthenticateToDelete: "You must be authenticated to delete members",
    timezoneConfirmedMessage: "Timezone confirmed! You can now select your available time slots.",
    timezoneSetMessage: "Timezone set to {timezone}! You can now select your available time slots.",
    errorLoadingData: "Error loading data: {error}",
    mustAuthenticateToSave: "You must be authenticated to save data",
    dataSavedSuccessfully: "Data saved successfully!",
    errorSavingData: "Error saving data: {error}",
    carPowerUpdated: "{username}'s {fields} updated successfully!",
    
    // Loading
    loading: "Loading...",
    
    // Conjunctions
    and: "and",
    
    // Mobile timeline
    bestServerTime: "Best server time: {slots}",
    membersAvailable: "{count} members available",
    noMembersAvailable: "No members available"
  },
  
  pt: {
    // Header
    title: "Aliança Dark Creed",
    subtitle: "Unir. Estrategizar. Dominar.",
    logout: "Sair",
    
    // Timezone Modal
    timezoneTitle: "🌍 Confirme Seu Fuso Horário",
    timezoneDescription: "Detectamos seu fuso horário automaticamente. Por favor, confirme se está correto antes de prosseguir:",
    detectedInfo: "📍 Informações Detectadas",
    yourLocalTime: "Seu Horário Local",
    serverTime: "Horário do Servidor",
    timezoneImportant: "Importante: Suas seleções de horário serão convertidas para o horário do servidor (UTC-2) para coordenação.",
    confirmContinue: "✅ Confirmar e Continuar",
    changeTimezone: "🔄 Alterar Fuso Horário",
    
    // Authentication
    authRequired: "Autenticação Necessária",
    notAuthenticated: "Não autenticado",
    authenticated: "Autenticado",
    githubTokenPlaceholder: "Token GitHub (obrigatório para todos os membros)",
    authenticate: "Autenticar",
    authDescription: "Todos os membros devem se autenticar antes de enviar informações.",
    contactR4R5: "Entre em contato com seu R4/R5 da aliança para obter o token GitHub.",
    
    // Form Section
    submitInfo: "Envie Suas Informações",
    howUpdatesWork: "💡 Como Funcionam as Atualizações",
    quickUpdate: "Atualização Rápida: Digite seu nome de usuário + novo poder do carro e/ou nível da torre → seus horários permanecem os mesmos",
    fullUpdate: "Atualização Completa: Digite seu nome de usuário + selecione novos horários → atualiza tudo (poder do carro/torre opcional)",
    newMembersNote: "Novos membros devem preencher todos os campos incluindo horários",
    
    // Timezone Status
    timezoneConfirmed: "✅ Fuso Horário Confirmado",
    timezoneSetupRequired: "🔒 Configuração de Fuso Horário Necessária",
    confirmTimezoneFirst: "Por favor, confirme seu fuso horário primeiro para habilitar a seleção de horários.",
    usingTimezone: "Usando fuso horário {timezone}",
    
    // Form Fields
    inGameUsername: "Nome de Usuário no Jogo",
    usernamePlaceholder: "Seu nome de usuário",
    mainCarPower: "Poder do Carro Principal",
    carPowerPlaceholder: "ex: 150000",
    towerLevel: "Nível da Torre",
    towerLevelPlaceholder: "1-33",
    timezone: "Fuso Horário",
    
    // Time Slots
    availableTimeSlots: "Horários Disponíveis",
    timeSlotDescription: "Selecione quando você geralmente está disponível (blocos de 2 horas no seu horário local)",
    submitInformation: "Enviar Informações",
    
    // Days of the week
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira", 
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
    
    // Timeline
    allianceTimeline: "Cronograma da Aliança (Horário do Servidor UTC-2)",
    memberAvailabilityScale: "Escala de disponibilidade dos membros (horários convertidos para horário do servidor UTC-2):",
    critical: "Crítico",
    low: "Baixo",
    moderate: "Moderado",
    good: "Bom",
    excellent: "Excelente",
    
    // Alliance Members
    allianceMembers: "Membros da Aliança",
    power: "Poder",
    tower: "Torre",
    language: "Idioma",
    
    // Tab Navigation
    submitInfoTab: "Enviar Info",
    registrationFormTab: "Formulário de Registro",
    registrationForm: "Formulário de Registro",
    viewAllianceTab: "Ver Aliança",
    
    // Registration Form
    registrationRequirements: "📋 Requisitos de Registro",
    vsEventRequirement: "Requisito Evento VS:",
    vsEventDescription: "TDC requer pelo menos 1M de pontos diários durante eventos semanais VS",
    completeAllFields: "Por favor complete todos os campos abaixo para enviar sua aplicação",
    regInGameUsername: "Nome de Usuário no Jogo *",
    regUsernamePlaceholder: "Seu nome de usuário no jogo",
    regMainCarPower: "Poder do Carro Principal *",
    regCarPowerPlaceholder: "ex: 2500000",
    regTowerLevel: "Nível da Torre *",
    regTowerLevelPlaceholder: "1-33",
    regDailyPoints: "Pontos Diários Evento VS (Média) *",
    regDailyPointsPlaceholder: "ex: 1200000",
    regExAlliances: "Alianças Anteriores",
    regExAlliancesPlaceholder: "Liste suas alianças anteriores (ou escreva 'Nenhuma' se esta for sua primeira)",
    regWhyLeft: "Por que você saiu de suas alianças anteriores?",
    regWhyLeftPlaceholder: "Explique suas razões para sair das alianças anteriores",
    regWhyJoin: "Por que você quer se juntar à TDC? *",
    regWhyJoinPlaceholder: "Nos conte por que você quer se juntar ao The Dark Creed e o que te motiva",
    regMotivation: "O que te motiva a jogar e se destacar? *",
    regMotivationPlaceholder: "Compartilhe o que te impulsiona a ter sucesso no jogo",
    submitRegistration: "Enviar Aplicação de Registro",
    adminSection: "🔒 Seção de Administração",
    viewPendingApplications: "Ver Aplicações Pendentes",
    pendingApplications: "Aplicações Pendentes",
    
    // Fields for member cards  
    carPower: "poder do carro",
    towerLevel: "nível da torre",
    
    // Messages
    authenticationSuccessful: "Autenticação bem-sucedida!",
    languageChanged: "Idioma alterado com sucesso!",
    enterGithubToken: "Por favor, digite um token GitHub",
    enterUsername: "Por favor, digite um nome de usuário",
    updateRequiresAtLeastOneField: "Por favor, digite o poder do carro ou o nível da torre para atualizar",
    mustAuthenticate: "Você deve se autenticar com um token GitHub antes de enviar suas informações!",
    confirmTimezoneBeforeSubmit: "Por favor, confirme seu fuso horário antes de enviar suas informações!",
    fillAllFields: "Por favor, preencha todos os campos obrigatórios",
    newMemberRequirements: "Novos membros devem fornecer poder do carro e nível da torre",
    memberInfoSubmitted: "Informações do membro enviadas com sucesso!",
    memberInfoUpdated: "Informações de {username} foram atualizadas!",
    memberInfoFullyUpdated: "Informações de {username} foram totalmente atualizadas!",
    confirmTimezoneBeforeSelect: "Por favor, confirme seu fuso horário primeiro!",
    enterR5Password: "Digite a senha R5 para deletar este membro:",
    incorrectPassword: "Senha incorreta. Membro não foi deletado.",
    memberRemoved: "{memberName} foi removido da aliança",
    mustAuthenticateToDelete: "Você deve estar autenticado para deletar membros",
    timezoneConfirmedMessage: "Fuso horário confirmado! Agora você pode selecionar seus horários disponíveis.",
    timezoneSetMessage: "Fuso horário definido para {timezone}! Agora você pode selecionar seus horários disponíveis.",
    errorLoadingData: "Erro ao carregar dados: {error}",
    mustAuthenticateToSave: "Você deve estar autenticado para salvar dados",
    dataSavedSuccessfully: "Dados salvos com sucesso!",
    errorSavingData: "Erro ao salvar dados: {error}",
    carPowerUpdated: "{fields} de {username} atualizado(s) com sucesso!",
    
    // Loading
    loading: "Carregando...",
    
    // Conjunctions
    and: "e",
    
    // Mobile timeline
    bestServerTime: "Melhor horário do servidor: {slots}",
    membersAvailable: "{count} membros disponíveis",
    noMembersAvailable: "Nenhum membro disponível"
  },
  
  fr: {
    // Header
    title: "Alliance Dark Creed",
    subtitle: "Unir. Stratégiser. Dominer.",
    logout: "Déconnexion",
    
    // Timezone Modal
    timezoneTitle: "🌍 Confirmez Votre Fuseau Horaire",
    timezoneDescription: "Nous avons détecté votre fuseau horaire automatiquement. Veuillez confirmer qu'il est correct avant de continuer :",
    detectedInfo: "📍 Informations Détectées",
    yourLocalTime: "Votre Heure Locale",
    serverTime: "Heure du Serveur",
    timezoneImportant: "Important : Vos sélections de créneaux horaires seront converties à l'heure du serveur (UTC-2) pour la coordination.",
    confirmContinue: "✅ Confirmer et Continuer",
    changeTimezone: "🔄 Changer de Fuseau Horaire",
    
    // Authentication
    authRequired: "Authentification Requise",
    notAuthenticated: "Non authentifié",
    authenticated: "Authentifié",
    githubTokenPlaceholder: "Token GitHub (requis pour tous les membres)",
    authenticate: "S'authentifier",
    authDescription: "Tous les membres doivent s'authentifier avant de soumettre des informations.",
    contactR4R5: "Contactez votre R4/R5 d'alliance pour le token GitHub.",
    
    // Form Section
    submitInfo: "Soumettez Vos Informations",
    howUpdatesWork: "💡 Comment Fonctionnent les Mises à Jour",
    quickUpdate: "Mise à jour rapide : Entrez votre nom d'utilisateur + nouvelle puissance de voiture et/ou niveau de tour → vos créneaux horaires restent identiques",
    fullUpdate: "Mise à jour complète : Entrez votre nom d'utilisateur + sélectionnez de nouveaux créneaux → met tout à jour (puissance de voiture/tour facultative)",
    newMembersNote: "Les nouveaux membres doivent remplir tous les champs y compris les créneaux horaires",
    
    // Timezone Status
    timezoneConfirmed: "✅ Fuseau Horaire Confirmé",
    timezoneSetupRequired: "🔒 Configuration du Fuseau Horaire Requise",
    confirmTimezoneFirst: "Veuillez d'abord confirmer votre fuseau horaire pour activer la sélection de créneaux.",
    usingTimezone: "Utilisant le fuseau horaire {timezone}",
    
    // Form Fields
    inGameUsername: "Nom d'Utilisateur en Jeu",
    usernamePlaceholder: "Votre nom d'utilisateur",
    mainCarPower: "Puissance de Voiture Principale",
    carPowerPlaceholder: "ex : 150000",
    towerLevel: "Niveau de Tour",
    towerLevelPlaceholder: "1-33",
    timezone: "Fuseau Horaire",
    
    // Time Slots
    availableTimeSlots: "Créneaux Horaires Disponibles",
    timeSlotDescription: "Sélectionnez quand vous êtes généralement disponible (blocs de 2 heures dans votre heure locale)",
    submitInformation: "Soumettre les Informations",
    
    // Days of the week
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi", 
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    
    // Timeline
    allianceTimeline: "Chronologie de l'Alliance (Heure du Serveur UTC-2)",
    memberAvailabilityScale: "Échelle de disponibilité des membres (heures converties à l'heure du serveur UTC-2) :",
    critical: "Critique",
    low: "Faible",
    moderate: "Modéré",
    good: "Bon",
    excellent: "Excellent",
    
    // Alliance Members
    allianceMembers: "Membres de l'Alliance",
    power: "Puissance",
    tower: "Tour",
    language: "Langue",
    
    // Tab Navigation
    submitInfoTab: "Soumettre Info",
    registrationFormTab: "Formulaire d'Inscription",
    registrationForm: "Formulaire d'Inscription",
    viewAllianceTab: "Voir Alliance",
    
    // Registration Form
    registrationRequirements: "📋 Exigences d'Inscription",
    vsEventRequirement: "Exigence Événement VS :",
    vsEventDescription: "TDC exige au moins 1M de points quotidiens pendant les événements hebdomadaires VS",
    completeAllFields: "Veuillez remplir tous les champs ci-dessous pour soumettre votre candidature",
    regInGameUsername: "Nom d'Utilisateur en Jeu *",
    regUsernamePlaceholder: "Votre nom d'utilisateur en jeu",
    regMainCarPower: "Puissance de Voiture Principale *",
    regCarPowerPlaceholder: "ex : 2500000",
    regTowerLevel: "Niveau de Tour *",
    regTowerLevelPlaceholder: "1-33",
    regDailyPoints: "Points Quotidiens Événement VS (Moyenne) *",
    regDailyPointsPlaceholder: "ex : 1200000",
    regExAlliances: "Alliances Précédentes",
    regExAlliancesPlaceholder: "Listez vos alliances précédentes (ou écrivez 'Aucune' si c'est votre première)",
    regWhyLeft: "Pourquoi avez-vous quitté vos alliances précédentes ?",
    regWhyLeftPlaceholder: "Expliquez vos raisons de quitter les alliances précédentes",
    regWhyJoin: "Pourquoi voulez-vous rejoindre TDC ? *",
    regWhyJoinPlaceholder: "Dites-nous pourquoi vous voulez rejoindre The Dark Creed et ce qui vous motive",
    regMotivation: "Qu'est-ce qui vous motive à jouer et exceller ? *",
    regMotivationPlaceholder: "Partagez ce qui vous pousse à réussir dans le jeu",
    submitRegistration: "Soumettre la Candidature d'Inscription",
    adminSection: "🔒 Section d'Administration",
    viewPendingApplications: "Voir les Candidatures en Attente",
    pendingApplications: "Candidatures en Attente",
    
    // Fields for member cards
    carPower: "puissance de voiture",
    towerLevel: "niveau de tour",
    
    // Messages
    authenticationSuccessful: "Authentification réussie !",
    languageChanged: "Langue modifiée avec succès !",
    enterGithubToken: "Veuillez entrer un token GitHub",
    enterUsername: "Veuillez entrer un nom d'utilisateur",
    updateRequiresAtLeastOneField: "Veuillez entrer la puissance de voiture ou le niveau de tour pour mettre à jour",
    mustAuthenticate: "Vous devez vous authentifier avec un token GitHub avant de soumettre vos informations !",
    confirmTimezoneBeforeSubmit: "Veuillez confirmer votre fuseau horaire avant de soumettre vos informations !",
    fillAllFields: "Veuillez remplir tous les champs requis",
    newMemberRequirements: "Les nouveaux membres doivent fournir la puissance de voiture et le niveau de tour",
    memberInfoSubmitted: "Informations du membre soumises avec succès !",
    memberInfoUpdated: "Les informations de {username} ont été mises à jour !",
    memberInfoFullyUpdated: "Les informations de {username} ont été entièrement mises à jour !",
    confirmTimezoneBeforeSelect: "Veuillez d'abord confirmer votre fuseau horaire !",
    enterR5Password: "Entrez le mot de passe R5 pour supprimer ce membre :",
    incorrectPassword: "Mot de passe incorrect. Membre non supprimé.",
    memberRemoved: "{memberName} a été retiré de l'alliance",
    mustAuthenticateToDelete: "Vous devez être authentifié pour supprimer des membres",
    timezoneConfirmedMessage: "Fuseau horaire confirmé ! Vous pouvez maintenant sélectionner vos créneaux disponibles.",
    timezoneSetMessage: "Fuseau horaire défini sur {timezone} ! Vous pouvez maintenant sélectionner vos créneaux disponibles.",
    errorLoadingData: "Erreur lors du chargement des données : {error}",
    mustAuthenticateToSave: "Vous devez être authentifié pour sauvegarder les données",
    dataSavedSuccessfully: "Données sauvegardées avec succès !",
    errorSavingData: "Erreur lors de la sauvegarde des données : {error}",
    carPowerUpdated: "{fields} de {username} mis à jour avec succès !",
    
    // Loading
    loading: "Chargement...",
    
    // Conjunctions
    and: "et",
    
    // Mobile timeline
    bestServerTime: "Meilleur horaire serveur : {slots}",
    membersAvailable: "{count} membres disponibles",
    noMembersAvailable: "Aucun membre disponible"
  },
  
  es: {
    // Header
    title: "Alianza Dark Creed",
    subtitle: "Unir. Estrategizar. Dominar.",
    logout: "Cerrar Sesión",
    
    // Timezone Modal
    timezoneTitle: "🌍 Confirma Tu Zona Horaria",
    timezoneDescription: "Hemos detectado tu zona horaria automáticamente. Por favor confirma que es correcta antes de continuar:",
    detectedInfo: "📍 Información Detectada",
    yourLocalTime: "Tu Hora Local",
    serverTime: "Hora del Servidor",
    timezoneImportant: "Importante: Tus selecciones de franjas horarias serán convertidas a la hora del servidor (UTC-2) para coordinación.",
    confirmContinue: "✅ Confirmar y Continuar",
    changeTimezone: "🔄 Cambiar Zona Horaria",
    
    // Authentication
    authRequired: "Autenticación Requerida",
    notAuthenticated: "No autenticado",
    authenticated: "Autenticado",
    githubTokenPlaceholder: "Token de GitHub (requerido para todos los miembros)",
    authenticate: "Autenticar",
    authDescription: "Todos los miembros deben autenticarse antes de enviar información.",
    contactR4R5: "Contacta a tu R4/R5 de la alianza para el token de GitHub.",
    
    // Form Section
    submitInfo: "Envía Tu Información",
    howUpdatesWork: "💡 Cómo Funcionan las Actualizaciones",
    quickUpdate: "Actualización Rápida: Ingresa tu nombre de usuario + nuevo poder de coche y/o nivel de torre → tus franjas horarias permanecen igual",
    fullUpdate: "Actualización Completa: Ingresa tu nombre de usuario + selecciona nuevas franjas horarias → actualiza todo (poder de coche/torre opcional)",
    newMembersNote: "Los nuevos miembros deben llenar todos los campos incluyendo franjas horarias",
    
    // Timezone Status
    timezoneConfirmed: "✅ Zona Horaria Confirmada",
    timezoneSetupRequired: "🔒 Configuración de Zona Horaria Requerida",
    confirmTimezoneFirst: "Por favor confirma tu zona horaria primero para habilitar la selección de franjas horarias.",
    usingTimezone: "Usando zona horaria {timezone}",
    
    // Form Fields
    inGameUsername: "Nombre de Usuario en el Juego",
    usernamePlaceholder: "Tu nombre de usuario",
    mainCarPower: "Poder del Coche Principal",
    carPowerPlaceholder: "ej: 150000",
    towerLevel: "Nivel de Torre",
    towerLevelPlaceholder: "1-33",
    timezone: "Zona Horaria",
    
    // Time Slots
    availableTimeSlots: "Franjas Horarias Disponibles",
    timeSlotDescription: "Selecciona cuándo estás generalmente disponible (bloques de 2 horas en tu hora local)",
    submitInformation: "Enviar Información",
    
    // Days of the week
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
    
    // Timeline
    allianceTimeline: "Cronología de la Alianza (Hora del Servidor UTC-2)",
    memberAvailabilityScale: "Escala de disponibilidad de miembros (horarios convertidos a hora del servidor UTC-2):",
    critical: "Crítico",
    low: "Bajo",
    moderate: "Moderado",
    good: "Bueno",
    excellent: "Excelente",
    
    // Alliance Members
    allianceMembers: "Miembros de la Alianza",
    power: "Poder",
    tower: "Torre",
    language: "Idioma",
    
    // Tab Navigation
    submitInfoTab: "Enviar Info",
    registrationFormTab: "Formulario de Registro",
    registrationForm: "Formulario de Registro",
    viewAllianceTab: "Ver Alianza",
    
    // Registration Form
    registrationRequirements: "📋 Requisitos de Registro",
    vsEventRequirement: "Requisito Evento VS:",
    vsEventDescription: "TDC requiere al menos 1M puntos diarios durante eventos semanales VS",
    completeAllFields: "Por favor complete todos los campos a continuación para enviar su aplicación",
    regInGameUsername: "Nombre de Usuario en el Juego *",
    regUsernamePlaceholder: "Tu nombre de usuario en el juego",
    regMainCarPower: "Poder del Coche Principal *",
    regCarPowerPlaceholder: "ej: 2500000",
    regTowerLevel: "Nivel de Torre *",
    regTowerLevelPlaceholder: "1-33",
    regDailyPoints: "Puntos Diarios Evento VS (Promedio) *",
    regDailyPointsPlaceholder: "ej: 1200000",
    regExAlliances: "Alianzas Anteriores",
    regExAlliancesPlaceholder: "Lista tus alianzas anteriores (o escribe 'Ninguna' si esta es tu primera)",
    regWhyLeft: "¿Por qué dejaste tus alianzas anteriores?",
    regWhyLeftPlaceholder: "Explica tus razones para dejar las alianzas anteriores",
    regWhyJoin: "¿Por qué quieres unirte a TDC? *",
    regWhyJoinPlaceholder: "Cuéntanos por qué quieres unirte a The Dark Creed y qué te motiva",
    regMotivation: "¿Qué te motiva a jugar y sobresalir? *",
    regMotivationPlaceholder: "Comparte lo que te impulsa a tener éxito en el juego",
    submitRegistration: "Enviar Aplicación de Registro",
    adminSection: "🔒 Sección de Administración",
    viewPendingApplications: "Ver Aplicaciones Pendientes",
    pendingApplications: "Aplicaciones Pendientes",
    
    // Fields for member cards
    carPower: "poder de coche",
    towerLevel: "nivel de torre",
    
    // Messages
    authenticationSuccessful: "¡Autenticación exitosa!",
    languageChanged: "¡Idioma cambiado exitosamente!",
    enterGithubToken: "Por favor ingresa un token de GitHub",
    enterUsername: "Por favor ingresa un nombre de usuario",
    updateRequiresAtLeastOneField: "Por favor ingresa el poder de coche o el nivel de torre para actualizar",
    mustAuthenticate: "¡Debes autenticarte con un token de GitHub antes de enviar tu información!",
    confirmTimezoneBeforeSubmit: "¡Por favor confirma tu zona horaria antes de enviar tu información!",
    fillAllFields: "Por favor llena todos los campos requeridos",
    newMemberRequirements: "Los nuevos miembros deben proporcionar poder de coche y nivel de torre",
    memberInfoSubmitted: "¡Información del miembro enviada exitosamente!",
    memberInfoUpdated: "¡La información de {username} ha sido actualizada!",
    memberInfoFullyUpdated: "¡La información de {username} ha sido completamente actualizada!",
    confirmTimezoneBeforeSelect: "¡Por favor confirma tu zona horaria primero!",
    enterR5Password: "Ingresa la contraseña R5 para eliminar este miembro:",
    incorrectPassword: "Contraseña incorrecta. Miembro no eliminado.",
    memberRemoved: "{memberName} ha sido removido de la alianza",
    mustAuthenticateToDelete: "Debes estar autenticado para eliminar miembros",
    timezoneConfirmedMessage: "¡Zona horaria confirmada! Ahora puedes seleccionar tus franjas horarias disponibles.",
    timezoneSetMessage: "¡Zona horaria establecida en {timezone}! Ahora puedes seleccionar tus franjas horarias disponibles.",
    errorLoadingData: "Error cargando datos: {error}",
    mustAuthenticateToSave: "Debes estar autenticado para guardar datos",
    dataSavedSuccessfully: "¡Datos guardados exitosamente!",
    errorSavingData: "Error guardando datos: {error}",
    carPowerUpdated: "¡{fields} de {username} actualizado(s) exitosamente!",
    
    // Loading
    loading: "Cargando...",
    
    // Conjunctions
    and: "y",
    
    // Mobile timeline
    bestServerTime: "Mejor horario del servidor: {slots}",
    membersAvailable: "{count} miembros disponibles",
    noMembersAvailable: "No hay miembros disponibles"
  },
  
  it: {
    // Header
    title: "Alleanza Dark Creed",
    subtitle: "Unire. Strategizzare. Dominare.",
    logout: "Esci",
    
    // Timezone Modal
    timezoneTitle: "🌍 Conferma il Tuo Fuso Orario",
    timezoneDescription: "Abbiamo rilevato automaticamente il tuo fuso orario. Per favore conferma che sia corretto prima di procedere:",
    detectedInfo: "📍 Informazioni Rilevate",
    yourLocalTime: "La Tua Ora Locale",
    serverTime: "Ora del Server",
    timezoneImportant: "Importante: Le tue selezioni di fasce orarie verranno convertite all'ora del server (UTC-2) per il coordinamento.",
    confirmContinue: "✅ Conferma e Continua",
    changeTimezone: "🔄 Cambia Fuso Orario",
    
    // Authentication
    authRequired: "Autenticazione Richiesta",
    notAuthenticated: "Non autenticato",
    authenticated: "Autenticato",
    githubTokenPlaceholder: "Token GitHub (richiesto per tutti i membri)",
    authenticate: "Autentica",
    authDescription: "Tutti i membri devono autenticarsi prima di inviare informazioni.",
    contactR4R5: "Contatta il tuo R4/R5 dell'alleanza per il token GitHub.",
    
    // Form Section
    submitInfo: "Invia le Tue Informazioni",
    howUpdatesWork: "💡 Come Funzionano gli Aggiornamenti",
    quickUpdate: "Aggiornamento Rapido: Inserisci il tuo nome utente + nuova potenza auto e/o livello torre → le tue fasce orarie rimangono uguali",
    fullUpdate: "Aggiornamento Completo: Inserisci il tuo nome utente + seleziona nuove fasce orarie → aggiorna tutto (potenza auto/torre opzionale)",
    newMembersNote: "I nuovi membri devono compilare tutti i campi incluse le fasce orarie",
    
    // Timezone Status
    timezoneConfirmed: "✅ Fuso Orario Confermato",
    timezoneSetupRequired: "🔒 Configurazione Fuso Orario Richiesta",
    confirmTimezoneFirst: "Per favore conferma prima il tuo fuso orario per abilitare la selezione delle fasce orarie.",
    usingTimezone: "Usando fuso orario {timezone}",
    
    // Form Fields
    inGameUsername: "Nome Utente nel Gioco",
    usernamePlaceholder: "Il tuo nome utente",
    mainCarPower: "Potenza Auto Principale",
    carPowerPlaceholder: "es: 150000",
    towerLevel: "Livello Torre",
    towerLevelPlaceholder: "1-33",
    timezone: "Fuso Orario",
    
    // Time Slots
    availableTimeSlots: "Fasce Orarie Disponibili",
    timeSlotDescription: "Seleziona quando sei solitamente disponibile (blocchi di 2 ore nel tuo orario locale)",
    submitInformation: "Invia Informazioni",
    
    // Days of the week
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
    
    // Timeline
    allianceTimeline: "Cronologia dell'Alleanza (Ora del Server UTC-2)",
    memberAvailabilityScale: "Scala disponibilità membri (orari convertiti all'ora del server UTC-2):",
    critical: "Critico",
    low: "Basso",
    moderate: "Moderato",
    good: "Buono",
    excellent: "Eccellente",
    
    // Alliance Members
    allianceMembers: "Membri dell'Alleanza",
    power: "Potenza",
    tower: "Torre",
    language: "Lingua",
    
    // Tab Navigation
    submitInfoTab: "Invia Info",
    registrationFormTab: "Modulo di Registrazione",
    registrationForm: "Modulo di Registrazione",
    viewAllianceTab: "Vedi Alleanza",
    
    // Registration Form
    registrationRequirements: "📋 Requisiti di Registrazione",
    vsEventRequirement: "Requisito Evento VS:",
    vsEventDescription: "TDC richiede almeno 1M punti giornalieri durante eventi settimanali VS",
    completeAllFields: "Per favore completa tutti i campi sottostanti per inviare la tua candidatura",
    regInGameUsername: "Nome Utente nel Gioco *",
    regUsernamePlaceholder: "Il tuo nome utente nel gioco",
    regMainCarPower: "Potenza Auto Principale *",
    regCarPowerPlaceholder: "es: 2500000",
    regTowerLevel: "Livello Torre *",
    regTowerLevelPlaceholder: "1-33",
    regDailyPoints: "Punti Giornalieri Evento VS (Media) *",
    regDailyPointsPlaceholder: "es: 1200000",
    regExAlliances: "Alleanze Precedenti",
    regExAlliancesPlaceholder: "Elenca le tue alleanze precedenti (o scrivi 'Nessuna' se questa è la tua prima)",
    regWhyLeft: "Perché hai lasciato le tue alleanze precedenti?",
    regWhyLeftPlaceholder: "Spiega le tue ragioni per aver lasciato le alleanze precedenti",
    regWhyJoin: "Perché vuoi unirti a TDC? *",
    regWhyJoinPlaceholder: "Raccontaci perché vuoi unirti a The Dark Creed e cosa ti motiva",
    regMotivation: "Cosa ti motiva a giocare ed eccellere? *",
    regMotivationPlaceholder: "Condividi cosa ti spinge ad avere successo nel gioco",
    submitRegistration: "Invia Candidatura di Registrazione",
    adminSection: "🔒 Sezione Amministrazione",
    viewPendingApplications: "Vedi Candidature Pendenti",
    pendingApplications: "Candidature Pendenti",
    
    // Fields for member cards
    carPower: "potenza auto",
    towerLevel: "livello torre",
    
    // Messages
    authenticationSuccessful: "Autenticazione riuscita!",
    languageChanged: "Lingua cambiata con successo!",
    enterGithubToken: "Per favore inserisci un token GitHub",
    enterUsername: "Per favore inserisci un nome utente",
    updateRequiresAtLeastOneField: "Per favore inserisci la potenza auto o il livello torre per aggiornare",
    mustAuthenticate: "Devi autenticarti con un token GitHub prima di inviare le tue informazioni!",
    confirmTimezoneBeforeSubmit: "Per favore conferma il tuo fuso orario prima di inviare le tue informazioni!",
    fillAllFields: "Per favore compila tutti i campi richiesti",
    newMemberRequirements: "I nuovi membri devono fornire potenza auto e livello torre",
    memberInfoSubmitted: "Informazioni membro inviate con successo!",
    memberInfoUpdated: "Le informazioni di {username} sono state aggiornate!",
    memberInfoFullyUpdated: "Le informazioni di {username} sono state completamente aggiornate!",
    confirmTimezoneBeforeSelect: "Per favore conferma prima il tuo fuso orario!",
    enterR5Password: "Inserisci la password R5 per eliminare questo membro:",
    incorrectPassword: "Password errata. Membro non eliminato.",
    memberRemoved: "{memberName} è stato rimosso dall'alleanza",
    mustAuthenticateToDelete: "Devi essere autenticato per eliminare membri",
    timezoneConfirmedMessage: "Fuso orario confermato! Ora puoi selezionare le tue fasce orarie disponibili.",
    timezoneSetMessage: "Fuso orario impostato su {timezone}! Ora puoi selezionare le tue fasce orarie disponibili.",
    errorLoadingData: "Errore nel caricamento dati: {error}",
    mustAuthenticateToSave: "Devi essere autenticato per salvare i dati",
    dataSavedSuccessfully: "Dati salvati con successo!",
    errorSavingData: "Errore nel salvataggio dati: {error}",
    carPowerUpdated: "{fields} di {username} aggiornato/i con successo!",
    
    // Loading
    loading: "Caricamento...",
    
    // Conjunctions
    and: "e",
    
    // Mobile timeline
    bestServerTime: "Miglior orario server: {slots}",
    membersAvailable: "{count} membri disponibili",
    noMembersAvailable: "Nessun membro disponibile"
  }
};

// Language configuration
const languages = {
  en: { name: "English", flag: "&#127482;&#127480;" },
  pt: { name: "Português", flag: "&#127463;&#127479;" },
  fr: { name: "Français", flag: "&#127467;&#127479;" },
  es: { name: "Español", flag: "&#127466;&#127480;" },
  it: { name: "Italiano", flag: "&#127470;&#127481;" }
};

// Current language state
let currentLanguage = localStorage.getItem("selectedLanguage") || "en";

// Translation helper function
function t(key, replacements = {}) {
  let text = translations[currentLanguage]?.[key] || translations.en[key] || key;

  // Replace placeholders like {username}, {error}, etc.
  Object.keys(replacements).forEach(placeholder => {
    text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
  });

  return text;
}

// Make translation function globally available
window.t = t;


// Update all translations on the page
function updateAllTranslations() {
  // Update elements with data-translate attribute
  document.querySelectorAll("[data-translate]").forEach(element => {
    const key = element.getAttribute("data-translate");
    element.textContent = t(key);
  });
  
  // Update elements with data-translate-html attribute (for HTML content)
  document.querySelectorAll("[data-translate-html]").forEach(element => {
    const key = element.getAttribute("data-translate-html");
    element.innerHTML = t(key);
  });
  
  // Update placeholders
  document.querySelectorAll("[data-translate-placeholder]").forEach(element => {
    const key = element.getAttribute("data-translate-placeholder");
    element.placeholder = t(key);
  });
  
  // Update dynamic timezone status text
  const confirmedTimezoneText = document.getElementById("confirmedTimezoneText");
  if (confirmedTimezoneText && window.State) {
    const { confirmed } = window.State.getTimezone();
    if (confirmed) {
      confirmedTimezoneText.textContent = t("usingTimezone", { timezone: confirmed });
    }
  }

  // Re-render UI if modules are available
  if (window.State && window.UI) {
    window.UI.render.timeSlots();
    window.UI.render.members();
    window.UI.render.timeline();
  }
}

// Make functions globally available
window.updateAllTranslations = updateAllTranslations;
window.languages = languages;