/**
 * Public site copy — PT (default), EN, ES.
 * Keys are flat dot-separated strings.
 */
export const translations = {
  pt: {
    'aria.language': 'Idioma',
    'aria.menu': 'Abrir menu',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',

    'nav.about': 'Quem Somos',
    'nav.programmes': 'Aulas e Modalidades',
    'nav.schedule': 'Horários',
    'nav.trial': 'Aula Experimental',
    'nav.team': 'Equipe',
    'nav.addresses': 'Unidades',
    'nav.store': 'Loja',
    'nav.studentArea': 'Área do Aluno',
    'nav.contact': 'Contato',

    'hero.brand': 'tubarão',
    'hero.equipe': 'equipe',
    'hero.unidades': 'unidades',
    'hero.loja': 'loja',

    'about.quote':
      'Acreditamos no jiu-jitsu como instrumento de transformação e saúde para todos.',
    'about.quoteAuthor': 'Prof. Márcio "Tubarão"',
    'about.description':
      'A GFTeam Tubarão é uma academia de Jiu-Jitsu dedicada a proporcionar uma experiência completa de treinamento para alunos de todas as idades e níveis. Nossa missão é desenvolver não apenas habilidades técnicas, mas também valores como disciplina, respeito e superação pessoal.',
    'about.gfteam':
      'Fazemos parte da rede GFTeam, uma das maiores e mais respeitadas equipes de Jiu-Jitsu do mundo, garantindo metodologia de ensino de excelência e suporte técnico de alto nível.',

    'programmes.title': 'Modalidades',
    'programmes.learnMore': 'Saiba mais',
    'programmes.p1.title': 'Jiu-Jitsu Adulto Unissex',
    'programmes.p1.desc':
      'Aulas para adultos de todas as idades, sem limite etário, com turmas unissex para iniciantes e graduados.',
    'programmes.p1.alt': 'Treino de Jiu-Jitsu adulto unissex',
    'programmes.p2.title': 'Jiu-Jitsu Gi e No Gi',
    'programmes.p2.desc':
      'Treinos técnicos com kimono (Gi) e sem kimono (No Gi), desenvolvendo adaptação, estratégia e performance.',
    'programmes.p2.alt': 'Treino de Jiu-Jitsu Gi e No Gi',
    'programmes.p3.title': 'Jiu-Jitsu Feminino',
    'programmes.p3.desc':
      'Aulas exclusivas para mulheres, em um ambiente acolhedor e seguro, focado em técnica, confiança e evolução.',
    'programmes.p3.alt': 'Aula de Jiu-Jitsu feminino',
    'programmes.p4.title': 'Jiu-Jitsu Baby e Juvenil',
    'programmes.p4.desc':
      'Programa para crianças e jovens com foco em coordenação, disciplina, respeito e desenvolvimento técnico no Jiu-Jitsu.',
    'programmes.p4.alt': 'Aula de Jiu-Jitsu Baby e Juvenil',

    'join.title': 'Quero treinar',
    'join.description':
      'Venha fazer uma aula experimental e conheça nossa metodologia. Oferecemos aulas para todos os níveis e idades.',
    'join.cta': 'Agendar aula experimental',

    'trial.title': 'Agende sua aula experimental',
    'trial.subtitle':
      'Preencha o formulário e nossa equipe vai entrar em contato para confirmar o melhor horário para você.',
    'trial.placeholder.name': 'Nome completo',
    'trial.placeholder.email': 'Email',
    'trial.placeholder.phone': 'Telefone com WhatsApp',
    'trial.placeholder.program': 'Interesse (opcional): Infantil, Adulto, Feminino...',
    'trial.placeholder.time': 'Melhor horário para treinar (opcional)',
    'trial.placeholder.notes': 'Observações (opcional)',
    'trial.submit': 'Enviar e agendar',
    'trial.submitting': 'Enviando...',
    'trial.success': 'Recebemos sua solicitação! Em breve entraremos em contato.',
    'trial.error': 'Não foi possível enviar sua solicitação. Tente novamente.',
    'trial.branchLabel': 'Unidade',
    'trial.branchPlaceholder': 'Selecione a unidade',
    'trial.branchRequired': 'Selecione a unidade onde deseja fazer a aula experimental.',
    'trial.selectBranchFirst': 'Escolha uma unidade para ver os horários disponíveis.',
    'trial.slotsLabel': 'Escolha um horário disponível',
    'trial.slotsLoading': 'Carregando horários...',
    'trial.slotRequired': 'Selecione um horário disponível para concluir o agendamento.',
    'trial.slotsEmpty':
      'No momento não há horários publicados para esta unidade. Envie seus dados e retornaremos com opções.',
    'trial.directionsButton': 'Como chegar',
    'trial.directionsLoading': 'Obtendo localização...',
    'trial.directionsDenied':
      'Localização não permitida. Abrindo o mapa só com o endereço da unidade.',
    'trial.directionsUnavailable': 'Geolocalização indisponível neste dispositivo.',
    'trial.instructorLine': 'Prof. {name}',
    'trial.classTypeLabel': 'Tipo de aula experimental',
    'trial.classType.experimental_group': 'Aula experimental em grupo',
    'trial.classType.private_class': 'Aula particular',
    'trial.privateScheduleLabel': 'Agendamento da Private Class',
    'trial.privateScheduleHint':
      'Selecione uma data e hora de segunda a sexta, entre 08:00 e 17:00.',
    'trial.privateDateLabel': 'Data desejada',
    'trial.privateTimeLabel': 'Hora desejada',
    'trial.privateDateRequired': 'Selecione a data da aula privada.',
    'trial.privateDateWeekdayOnly': 'A Private Class deve ser agendada em dia útil (segunda a sexta).',
    'trial.privateTimeRequired': 'Selecione o horário da aula privada.',
    'trial.privateTimeRangeError': 'A Private Class aceita horários entre 08:00 e 17:00.',
    'trial.privateSuccess': 'Recebemos sua solicitação de Private Class! Em breve entraremos em contato.',
    'trial.selectOption': 'Selecione...',
    'trial.yes': 'Sim',
    'trial.no': 'Não',
    'trial.hasGiLabel': 'Possui kimono?',
    'trial.giSizeLabel': 'Tamanho do kimono',
    'trial.previousExperienceLabel': 'Já praticou jiu-jitsu?',
    'trial.experienceDurationLabel': 'Se sim, por quanto tempo?',
    'trial.currentBeltLabel': 'Graduação atual',
    'trial.stripeCountLabel': 'Número de listras',
    'trial.previousTeamLabel': 'Equipe anterior (opcional)',
    'trial.genderLabel': 'Sexo',
    'trial.genderFemale': 'Feminino',
    'trial.genderMale': 'Masculino',
    'trial.genderPreferNot': 'Prefiro não informar',
    'trial.preferFemaleInstructorLabel': 'Preferência por professora/instrutora feminina?',
    'trial.hasGiRequired': 'Informe se possui kimono.',
    'trial.giSizeRequired': 'Informe o tamanho do kimono (A1, A2, A3 ou A4).',
    'trial.previousExperienceRequired': 'Informe se já praticou jiu-jitsu.',
    'trial.experienceDurationRequired': 'Informe por quanto tempo já praticou.',
    'trial.currentBeltRequired': 'Informe sua graduação atual.',
    'trial.stripeCountInvalid': 'Informe o número de listras (0 a 20).',
    'trial.genderRequired': 'Informe o sexo.',
    'trial.preferFemaleInstructorRequired':
      'Informe se tem preferência por professora/instrutora feminina.',
    'trial.medicalTitle': 'Questionário médico (obrigatório)',
    'trial.medicalDescription':
      'Questionário médico inicial para agendamento de aula experimental.',
    'trial.medical.question.question_1':
      'Algum médico já disse que você possui problema de coração e que só deve realizar atividade física supervisionada?',
    'trial.medical.question.question_2':
      'Você sente dor no peito quando pratica atividade física?',
    'trial.medical.question.question_3':
      'Você sentiu dor no peito no último mês sem estar praticando atividade física?',
    'trial.medical.question.question_4':
      'Você perde o equilíbrio por tontura ou já perdeu a consciência?',
    'trial.medical.question.question_5':
      'Você possui problema ósseo ou articular que pode piorar com atividade física?',
    'trial.medical.question.question_6':
      'Seu médico prescreveu medicamentos para pressão arterial ou problema cardíaco?',
    'trial.medical.question.question_7':
      'Você conhece outro motivo que impeça a prática de atividade física?',
    'trial.medical.question.question_8':
      'Você possui histórico de convulsão, desmaio ou crise epiléptica?',
    'trial.medical.question.question_9':
      'Você possui alguma alergia grave ou condição respiratória importante?',
    'trial.medical.question.question_10':
      'Nos últimos 12 meses você realizou cirurgia, internação ou tratamento médico relevante?',
    'trial.medical.question.additional_info':
      'Se respondeu SIM em alguma pergunta, descreva brevemente (opcional).',
    'trial.medicalRequired':
      'Responda todas as perguntas obrigatórias do questionário médico para continuar.',
    'trial.termsAgreement':
      'Declaro que li e concordo com a Política de Privacidade e os Termos de Uso.',
    'trial.termsRequired':
      'Você precisa aceitar a Política de Privacidade e os Termos de Uso para enviar o agendamento.',

    'highlights.title': 'Destaques',

    'team.title': 'Equipe',
    'team.loading': 'Carregando...',
    'team.empty':
      'Conheça o Professor Márcio "Tubarão" e nossa equipe de instrutores. (Conteúdo em breve.)',
    'team.showDescription': 'Ver descrição',
    'team.hideDescription': 'Ocultar descrição',

    'addresses.title': 'Unidades',
    'addresses.mapSubtitle': 'Veja nossas unidades no mapa e trace a melhor rota para chegar.',
    'addresses.loading': 'Carregando...',
    'addresses.empty': 'Vila Isabel (Sede) e Tijuca. Endereços e fotos em breve.',
    'addresses.noMapPoints':
      'Ainda não há coordenadas publicadas para exibir no mapa. Confira os endereços abaixo.',
    'addresses.withoutCoordinatesTitle': 'Unidades sem coordenadas no mapa',
    'addresses.withoutCoordinatesHint':
      'Essas unidades ainda podem ser acessadas pelo botão "Como chegar" usando o endereço.',
    'addresses.parkingYes': 'Estacionamento',
    'addresses.parkingNear': 'Estacionamento próximo',
    'addresses.directionsButton': 'Como chegar',
    'addresses.directionsLoading': 'Obtendo localização...',
    'addresses.directionsDenied':
      'Localização não permitida. Abrindo o mapa apenas com o endereço da unidade.',
    'addresses.directionsUnavailable': 'Geolocalização indisponível neste dispositivo.',

    'store.title': 'Loja',
    'store.loading': 'Carregando...',
    'store.empty': 'Produtos Tubarão BJJ em breve. Compra via WhatsApp/Instagram.',
    'store.variants': 'Variantes',
    'store.buyWhatsapp': 'Comprar via WhatsApp',
    'store.checkout': 'Pagar online',
    'store.checkoutLoading': 'Iniciando checkout...',
    'store.checkoutError': 'Não foi possível iniciar o checkout online no momento.',

    'schedule.title': 'Horários',
    'schedule.subtitle': 'Confira os horários das aulas por unidade e dia da semana.',
    'schedule.loading': 'Carregando...',
    'schedule.empty': 'Horários em breve. Volte em breve ou fale conosco pelo WhatsApp.',
    'schedule.unknownBranch': 'Unidade',
    'schedule.instructorPrefix': 'Prof.',
    'schedule.day.0': 'Domingo',
    'schedule.day.1': 'Segunda-feira',
    'schedule.day.2': 'Terça-feira',
    'schedule.day.3': 'Quarta-feira',
    'schedule.day.4': 'Quinta-feira',
    'schedule.day.5': 'Sexta-feira',
    'schedule.day.6': 'Sábado',

    'footer.sendMessage': 'Enviar mensagem',
    'footer.placeholder.name': 'Nome',
    'footer.placeholder.email': 'Email',
    'footer.placeholder.phone': 'Telefone (opcional)',
    'footer.placeholder.message': 'Sua mensagem',
    'footer.sending': 'Enviando...',
    'footer.submitContact': 'Enviar mensagem',
    'footer.contactSuccess': 'Mensagem enviada com sucesso!',
    'footer.contactError': 'Erro ao enviar. Tente novamente.',
    'footer.brand': 'GFTeam Tubarão',
    'footer.tagline': 'GFTeam Tubarão',
    'footer.quickLinks': 'Links Rápidos',
    'footer.contactSection': 'Contato',
    'footer.newsletter': 'Newsletter',
    'footer.placeholder.newsletterEmail': 'Seu email',
    'footer.newsletterSuccess': 'Inscrição realizada com sucesso!',
    'footer.subscribe': 'Inscrever-se',
    'footer.copyright': '© {year} GFTeam Tubarão. Todos os direitos reservados.',
    'footer.privacy': 'Política de Privacidade',
    'legal.bannerText':
      'Usamos seus dados para melhorar sua experiência e registrar consentimentos legais.',
    'legal.privacy': 'Política de Privacidade',
    'legal.terms': 'Termos de Uso',
    'legal.accept': 'Aceitar e continuar',
    'legal.later': 'Depois',
    'legal.saving': 'Salvando...',
    'legal.close': 'Fechar',
    'legal.notAvailable': 'Conteúdo não disponível no momento.',
  },

  en: {
    'aria.language': 'Language',
    'aria.menu': 'Toggle menu',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',

    'nav.about': 'About us',
    'nav.programmes': 'Classes & programs',
    'nav.schedule': 'Schedule',
    'nav.trial': 'Trial class',
    'nav.team': 'Team',
    'nav.addresses': 'Locations',
    'nav.store': 'Store',
    'nav.studentArea': 'Student Area',
    'nav.contact': 'Contact',

    'hero.brand': 'tubarão',
    'hero.equipe': 'team',
    'hero.unidades': 'locations',
    'hero.loja': 'store',

    'about.quote':
      'We believe jiu-jitsu is a tool for transformation and health for everyone.',
    'about.quoteAuthor': 'Prof. Márcio "Tubarão"',
    'about.description':
      'GFTeam Tubarão is a Jiu-Jitsu academy dedicated to a complete training experience for students of all ages and levels. Our mission is to develop not only technical skills but also values such as discipline, respect, and personal growth.',
    'about.gfteam':
      'We are part of the GFTeam network, one of the largest and most respected Jiu-Jitsu teams in the world, ensuring excellent teaching methodology and high-level technical support.',

    'programmes.title': 'Programs',
    'programmes.learnMore': 'Learn more',
    'programmes.p1.title': 'Adult Jiu-Jitsu (all genders)',
    'programmes.p1.desc':
      'Classes for adults of all ages, with no age limit, and unisex groups for beginners and advanced students.',
    'programmes.p1.alt': 'Adult unisex Jiu-Jitsu training',
    'programmes.p2.title': 'Gi & No-Gi Jiu-Jitsu',
    'programmes.p2.desc':
      'Technical training with the gi and without the gi (No-Gi), building adaptation, strategy, and performance.',
    'programmes.p2.alt': 'Gi and No-Gi Jiu-Jitsu training',
    'programmes.p3.title': 'Women’s Jiu-Jitsu',
    'programmes.p3.desc':
      'Classes exclusively for women in a welcoming, safe environment focused on technique, confidence, and progress.',
    'programmes.p3.alt': 'Women’s Jiu-Jitsu class',
    'programmes.p4.title': 'Kids & teens Jiu-Jitsu',
    'programmes.p4.desc':
      'A program for children and teens focused on coordination, discipline, respect, and technical development in Jiu-Jitsu.',
    'programmes.p4.alt': 'Kids and teens Jiu-Jitsu class',

    'join.title': 'I want to train',
    'join.description':
      'Book a trial class and discover our methodology. We offer classes for all levels and ages.',
    'join.cta': 'Book a trial class',

    'trial.title': 'Book your trial class',
    'trial.subtitle':
      'Fill out the form and our team will contact you to confirm the best training time.',
    'trial.placeholder.name': 'Full name',
    'trial.placeholder.email': 'Email',
    'trial.placeholder.phone': 'Phone with WhatsApp',
    'trial.placeholder.program': 'Interest (optional): Kids, Adults, Women...',
    'trial.placeholder.time': 'Preferred training time (optional)',
    'trial.placeholder.notes': 'Notes (optional)',
    'trial.submit': 'Submit and schedule',
    'trial.submitting': 'Submitting...',
    'trial.success': 'We got your request! Our team will contact you soon.',
    'trial.error': 'Could not send your request. Please try again.',
    'trial.branchLabel': 'Location',
    'trial.branchPlaceholder': 'Select location',
    'trial.branchRequired': 'Please select the location for your trial class.',
    'trial.selectBranchFirst': 'Choose a location to see available times.',
    'trial.slotsLabel': 'Choose an available time',
    'trial.slotsLoading': 'Loading times...',
    'trial.slotRequired': 'Please select an available time to complete your booking.',
    'trial.slotsEmpty':
      'No published times for this location right now. Send your details and we will get back to you.',
    'trial.directionsButton': 'Directions',
    'trial.directionsLoading': 'Getting your location...',
    'trial.directionsDenied': 'Location denied. Opening the map with the gym address only.',
    'trial.directionsUnavailable': 'Geolocation is not available on this device.',
    'trial.instructorLine': 'Prof. {name}',
    'trial.classTypeLabel': 'Type of Experimental Class',
    'trial.classType.experimental_group': 'Experimental Class Group',
    'trial.classType.private_class': 'Private Class',
    'trial.privateScheduleLabel': 'Private Class schedule request',
    'trial.privateScheduleHint': 'Choose a weekday date and time between 08:00 and 17:00.',
    'trial.privateDateLabel': 'Preferred date',
    'trial.privateTimeLabel': 'Preferred time',
    'trial.privateDateRequired': 'Please select a date for the private class.',
    'trial.privateDateWeekdayOnly': 'Private Class must be requested on weekdays (Monday to Friday).',
    'trial.privateTimeRequired': 'Please select a time for the private class.',
    'trial.privateTimeRangeError': 'Private Class times must be between 08:00 and 17:00.',
    'trial.privateSuccess':
      'We received your Private Class request! Our team will contact you shortly.',
    'trial.selectOption': 'Select...',
    'trial.yes': 'Yes',
    'trial.no': 'No',
    'trial.hasGiLabel': 'Do you have a gi?',
    'trial.giSizeLabel': 'Gi size',
    'trial.previousExperienceLabel': 'Have you trained jiu-jitsu before?',
    'trial.experienceDurationLabel': 'If yes, for how long?',
    'trial.currentBeltLabel': 'Current belt rank',
    'trial.stripeCountLabel': 'Number of stripes',
    'trial.previousTeamLabel': 'Previous team (optional)',
    'trial.genderLabel': 'Gender',
    'trial.genderFemale': 'Female',
    'trial.genderMale': 'Male',
    'trial.genderPreferNot': 'Prefer not to inform',
    'trial.preferFemaleInstructorLabel': 'Do you prefer a female instructor?',
    'trial.hasGiRequired': 'Please indicate if you have a gi.',
    'trial.giSizeRequired': 'Please select your gi size (A1, A2, A3 or A4).',
    'trial.previousExperienceRequired': 'Please indicate if you have previous jiu-jitsu experience.',
    'trial.experienceDurationRequired': 'Please inform your training duration.',
    'trial.currentBeltRequired': 'Please inform your current belt rank.',
    'trial.stripeCountInvalid': 'Please inform the stripe count (0 to 20).',
    'trial.genderRequired': 'Please select your gender.',
    'trial.preferFemaleInstructorRequired':
      'Please indicate if you prefer a female instructor.',
    'trial.medicalTitle': 'Medical questionnaire (required)',
    'trial.medicalDescription':
      'Initial medical questionnaire required for trial class booking.',
    'trial.medical.question.question_1':
      'Has a doctor ever said you have a heart condition and that you should only do physical activity under supervision?',
    'trial.medical.question.question_2':
      'Do you feel chest pain during physical activity?',
    'trial.medical.question.question_3':
      'Have you felt chest pain in the last month when not doing physical activity?',
    'trial.medical.question.question_4':
      'Do you lose balance due to dizziness or have you ever lost consciousness?',
    'trial.medical.question.question_5':
      'Do you have any bone or joint problem that may worsen with physical activity?',
    'trial.medical.question.question_6':
      'Has your doctor prescribed medication for blood pressure or a heart condition?',
    'trial.medical.question.question_7':
      'Do you know of any other reason that would prevent you from doing physical activity?',
    'trial.medical.question.question_8':
      'Do you have a history of seizures, fainting, or epileptic episodes?',
    'trial.medical.question.question_9':
      'Do you have any severe allergy or significant respiratory condition?',
    'trial.medical.question.question_10':
      'In the last 12 months, have you had surgery, hospitalization, or relevant medical treatment?',
    'trial.medical.question.additional_info':
      'If you answered YES to any question, briefly describe it (optional).',
    'trial.medicalRequired':
      'Please complete all required medical questionnaire fields before submitting.',
    'trial.termsAgreement':
      'I have read and agree to the Privacy Policy and Terms of Use.',
    'trial.termsRequired':
      'You must agree to the Privacy Policy and Terms of Use to submit this booking.',

    'highlights.title': 'Highlights',

    'team.title': 'Team',
    'team.loading': 'Loading...',
    'team.empty':
      'Meet Professor Márcio "Tubarão" and our instructors. (Content coming soon.)',
    'team.showDescription': 'Show description',
    'team.hideDescription': 'Hide description',

    'addresses.title': 'Locations',
    'addresses.mapSubtitle': 'See our locations on the map and get directions to each branch.',
    'addresses.loading': 'Loading...',
    'addresses.empty': 'Vila Isabel (headquarters) and Tijuca. Addresses and photos coming soon.',
    'addresses.noMapPoints':
      'There are no published coordinates yet to display on the map. Check the addresses below.',
    'addresses.withoutCoordinatesTitle': 'Locations without map coordinates',
    'addresses.withoutCoordinatesHint':
      'These locations can still be accessed using the address through the Directions button.',
    'addresses.parkingYes': 'Parking',
    'addresses.parkingNear': 'Nearby parking',
    'addresses.directionsButton': 'Directions',
    'addresses.directionsLoading': 'Getting your location...',
    'addresses.directionsDenied': 'Location denied. Opening the map with the branch address only.',
    'addresses.directionsUnavailable': 'Geolocation is not available on this device.',

    'store.title': 'Store',
    'store.loading': 'Loading...',
    'store.empty': 'Tubarão BJJ products coming soon. Purchase via WhatsApp/Instagram.',
    'store.variants': 'Variants',
    'store.buyWhatsapp': 'Buy via WhatsApp',
    'store.checkout': 'Pay online',
    'store.checkoutLoading': 'Starting checkout...',
    'store.checkoutError': 'Could not start online checkout right now.',

    'schedule.title': 'Schedule',
    'schedule.subtitle': 'Class times by location and day of the week.',
    'schedule.loading': 'Loading...',
    'schedule.empty': 'Schedule coming soon. Check back or contact us on WhatsApp.',
    'schedule.unknownBranch': 'Location',
    'schedule.instructorPrefix': 'Coach',
    'schedule.day.0': 'Sunday',
    'schedule.day.1': 'Monday',
    'schedule.day.2': 'Tuesday',
    'schedule.day.3': 'Wednesday',
    'schedule.day.4': 'Thursday',
    'schedule.day.5': 'Friday',
    'schedule.day.6': 'Saturday',

    'footer.sendMessage': 'Send a message',
    'footer.placeholder.name': 'Name',
    'footer.placeholder.email': 'Email',
    'footer.placeholder.phone': 'Phone (optional)',
    'footer.placeholder.message': 'Your message',
    'footer.sending': 'Sending...',
    'footer.submitContact': 'Send message',
    'footer.contactSuccess': 'Message sent successfully!',
    'footer.contactError': 'Could not send. Please try again.',
    'footer.brand': 'GFTeam Tubarão',
    'footer.tagline': 'GFTeam Tubarão',
    'footer.quickLinks': 'Quick links',
    'footer.contactSection': 'Contact',
    'footer.newsletter': 'Newsletter',
    'footer.placeholder.newsletterEmail': 'Your email',
    'footer.newsletterSuccess': 'Subscription successful!',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© {year} GFTeam Tubarão. All rights reserved.',
    'footer.privacy': 'Privacy policy',
    'legal.bannerText':
      'We use your data to improve your experience and register legal consent.',
    'legal.privacy': 'Privacy Policy',
    'legal.terms': 'Terms of Use',
    'legal.accept': 'Accept and continue',
    'legal.later': 'Later',
    'legal.saving': 'Saving...',
    'legal.close': 'Close',
    'legal.notAvailable': 'Content not available at the moment.',
  },

  es: {
    'aria.language': 'Idioma',
    'aria.menu': 'Abrir menú',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',

    'nav.about': 'Quiénes somos',
    'nav.programmes': 'Clases y modalidades',
    'nav.schedule': 'Horarios',
    'nav.trial': 'Clase de prueba',
    'nav.team': 'Equipo',
    'nav.addresses': 'Sedes',
    'nav.store': 'Tienda',
    'nav.studentArea': 'Área del Alumno',
    'nav.contact': 'Contacto',

    'hero.brand': 'tubarão',
    'hero.equipe': 'equipo',
    'hero.unidades': 'sedes',
    'hero.loja': 'tienda',

    'about.quote':
      'Creemos en el jiu-jitsu como instrumento de transformación y salud para todos.',
    'about.quoteAuthor': 'Prof. Márcio "Tubarão"',
    'about.description':
      'GFTeam Tubarão es una academia de Jiu-Jitsu dedicada a ofrecer una experiencia completa de entrenamiento para alumnos de todas las edades y niveles. Nuestra misión es desarrollar no solo habilidades técnicas, sino también valores como disciplina, respeto y superación personal.',
    'about.gfteam':
      'Formamos parte de la red GFTeam, uno de los equipos de Jiu-Jitsu más grandes y respetados del mundo, garantizando metodología de enseñanza de excelencia y soporte técnico de alto nivel.',

    'programmes.title': 'Modalidades',
    'programmes.learnMore': 'Saber más',
    'programmes.p1.title': 'Jiu-Jitsu adulto unisex',
    'programmes.p1.desc':
      'Clases para adultos de todas las edades, sin límite de edad, con grupos unisex para principiantes y graduados.',
    'programmes.p1.alt': 'Entrenamiento de Jiu-Jitsu adulto unisex',
    'programmes.p2.title': 'Jiu-Jitsu Gi y No Gi',
    'programmes.p2.desc':
      'Entrenamientos técnicos con kimono (Gi) y sin kimono (No Gi), desarrollando adaptación, estrategia y rendimiento.',
    'programmes.p2.alt': 'Entrenamiento de Jiu-Jitsu Gi y No Gi',
    'programmes.p3.title': 'Jiu-Jitsu femenino',
    'programmes.p3.desc':
      'Clases exclusivas para mujeres, en un ambiente acogedor y seguro, enfocado en técnica, confianza y evolución.',
    'programmes.p3.alt': 'Clase de Jiu-Jitsu femenino',
    'programmes.p4.title': 'Jiu-Jitsu infantil y juvenil',
    'programmes.p4.desc':
      'Programa para niños y jóvenes con foco en coordinación, disciplina, respeto y desarrollo técnico en Jiu-Jitsu.',
    'programmes.p4.alt': 'Clase de Jiu-Jitsu infantil y juvenil',

    'join.title': 'Quiero entrenar',
    'join.description':
      'Ven a una clase de prueba y conoce nuestra metodología. Ofrecemos clases para todos los niveles y edades.',
    'join.cta': 'Agendar clase de prueba',

    'trial.title': 'Agenda tu clase de prueba',
    'trial.subtitle':
      'Completa el formulario y nuestro equipo te contactará para confirmar el mejor horario.',
    'trial.placeholder.name': 'Nombre completo',
    'trial.placeholder.email': 'Email',
    'trial.placeholder.phone': 'Teléfono con WhatsApp',
    'trial.placeholder.program': 'Interés (opcional): Infantil, Adultos, Femenino...',
    'trial.placeholder.time': 'Mejor horario para entrenar (opcional)',
    'trial.placeholder.notes': 'Observaciones (opcional)',
    'trial.submit': 'Enviar y agendar',
    'trial.submitting': 'Enviando...',
    'trial.success': 'Recibimos tu solicitud. Nuestro equipo te contactará pronto.',
    'trial.error': 'No se pudo enviar tu solicitud. Inténtalo nuevamente.',
    'trial.branchLabel': 'Sede',
    'trial.branchPlaceholder': 'Selecciona la sede',
    'trial.branchRequired': 'Selecciona la sede donde quieres la clase de prueba.',
    'trial.selectBranchFirst': 'Elige una sede para ver los horarios disponibles.',
    'trial.slotsLabel': 'Elige un horario disponible',
    'trial.slotsLoading': 'Cargando horarios...',
    'trial.slotRequired': 'Selecciona un horario disponible para completar la reserva.',
    'trial.slotsEmpty':
      'No hay horarios publicados para esta sede. Envía tus datos y te contactaremos.',
    'trial.directionsButton': 'Cómo llegar',
    'trial.directionsLoading': 'Obteniendo ubicación...',
    'trial.directionsDenied':
      'Ubicación no permitida. Abriendo el mapa solo con la dirección de la sede.',
    'trial.directionsUnavailable': 'Geolocalización no disponible en este dispositivo.',
    'trial.instructorLine': 'Prof. {name}',
    'trial.classTypeLabel': 'Tipo de clase experimental',
    'trial.classType.experimental_group': 'Clase experimental en grupo',
    'trial.classType.private_class': 'Clase particular',
    'trial.privateScheduleLabel': 'Solicitud de horario para Private Class',
    'trial.privateScheduleHint':
      'Selecciona fecha y hora de lunes a viernes, entre las 08:00 y las 17:00.',
    'trial.privateDateLabel': 'Fecha deseada',
    'trial.privateTimeLabel': 'Hora deseada',
    'trial.privateDateRequired': 'Selecciona la fecha de la clase privada.',
    'trial.privateDateWeekdayOnly': 'La Private Class debe solicitarse en día hábil (lunes a viernes).',
    'trial.privateTimeRequired': 'Selecciona la hora de la clase privada.',
    'trial.privateTimeRangeError': 'La Private Class permite horarios entre 08:00 y 17:00.',
    'trial.privateSuccess':
      'Recibimos tu solicitud de Private Class. Nuestro equipo te contactará pronto.',
    'trial.selectOption': 'Selecciona...',
    'trial.yes': 'Sí',
    'trial.no': 'No',
    'trial.hasGiLabel': '¿Tienes kimono?',
    'trial.giSizeLabel': 'Tamaño del kimono',
    'trial.previousExperienceLabel': '¿Ya practicaste jiu-jitsu?',
    'trial.experienceDurationLabel': 'Si sí, ¿por cuánto tiempo?',
    'trial.currentBeltLabel': 'Graduación actual',
    'trial.stripeCountLabel': 'Número de rayas',
    'trial.previousTeamLabel': 'Equipo anterior (opcional)',
    'trial.genderLabel': 'Sexo',
    'trial.genderFemale': 'Femenino',
    'trial.genderMale': 'Masculino',
    'trial.genderPreferNot': 'Prefiero no informar',
    'trial.preferFemaleInstructorLabel': '¿Prefieres profesora/instructora femenina?',
    'trial.hasGiRequired': 'Indica si tienes kimono.',
    'trial.giSizeRequired': 'Indica el tamaño del kimono (A1, A2, A3 o A4).',
    'trial.previousExperienceRequired': 'Indica si ya practicaste jiu-jitsu.',
    'trial.experienceDurationRequired': 'Indica por cuánto tiempo ya practicaste.',
    'trial.currentBeltRequired': 'Indica tu graduación actual.',
    'trial.stripeCountInvalid': 'Indica el número de rayas (0 a 20).',
    'trial.genderRequired': 'Indica el sexo.',
    'trial.preferFemaleInstructorRequired':
      'Indica si tienes preferencia por profesora/instructora femenina.',
    'trial.medicalTitle': 'Cuestionario médico (obligatorio)',
    'trial.medicalDescription':
      'Cuestionario médico inicial para agendar la clase de prueba.',
    'trial.medical.question.question_1':
      '¿Algún médico te ha dicho que tienes un problema cardíaco y que solo debes hacer actividad física con supervisión?',
    'trial.medical.question.question_2':
      '¿Sientes dolor en el pecho cuando realizas actividad física?',
    'trial.medical.question.question_3':
      '¿Sentiste dolor en el pecho en el último mes sin estar haciendo actividad física?',
    'trial.medical.question.question_4':
      '¿Pierdes el equilibrio por mareo o alguna vez perdiste el conocimiento?',
    'trial.medical.question.question_5':
      '¿Tienes algún problema óseo o articular que pueda empeorar con actividad física?',
    'trial.medical.question.question_6':
      '¿Tu médico te recetó medicamentos para la presión arterial o un problema cardíaco?',
    'trial.medical.question.question_7':
      '¿Conoces alguna otra razón que te impida realizar actividad física?',
    'trial.medical.question.question_8':
      '¿Tienes historial de convulsiones, desmayos o crisis epilépticas?',
    'trial.medical.question.question_9':
      '¿Tienes alguna alergia grave o condición respiratoria importante?',
    'trial.medical.question.question_10':
      '¿En los últimos 12 meses tuviste cirugía, hospitalización o tratamiento médico relevante?',
    'trial.medical.question.additional_info':
      'Si respondiste SÍ a alguna pregunta, descríbelo brevemente (opcional).',
    'trial.medicalRequired':
      'Responde todas las preguntas obligatorias del cuestionario médico para continuar.',
    'trial.termsAgreement':
      'Declaro que leí y acepto la Política de Privacidad y los Términos de Uso.',
    'trial.termsRequired':
      'Debes aceptar la Política de Privacidad y los Términos de Uso para enviar la reserva.',

    'highlights.title': 'Destacados',

    'team.title': 'Equipo',
    'team.loading': 'Cargando...',
    'team.empty':
      'Conoce al Profesor Márcio "Tubarão" y a nuestros instructores. (Contenido próximamente.)',
    'team.showDescription': 'Ver descripción',
    'team.hideDescription': 'Ocultar descripción',

    'addresses.title': 'Sedes',
    'addresses.mapSubtitle': 'Consulta nuestras sedes en el mapa y obtén la mejor ruta para llegar.',
    'addresses.loading': 'Cargando...',
    'addresses.empty': 'Vila Isabel (sede) y Tijuca. Direcciones y fotos próximamente.',
    'addresses.noMapPoints':
      'Aún no hay coordenadas publicadas para mostrar en el mapa. Consulta las direcciones abajo.',
    'addresses.withoutCoordinatesTitle': 'Sedes sin coordenadas en el mapa',
    'addresses.withoutCoordinatesHint':
      'Estas sedes aún pueden abrirse con el botón "Cómo llegar" usando la dirección.',
    'addresses.parkingYes': 'Estacionamiento',
    'addresses.parkingNear': 'Estacionamiento cercano',
    'addresses.directionsButton': 'Cómo llegar',
    'addresses.directionsLoading': 'Obteniendo ubicación...',
    'addresses.directionsDenied':
      'Ubicación no permitida. Abriendo el mapa solo con la dirección de la sede.',
    'addresses.directionsUnavailable': 'Geolocalización no disponible en este dispositivo.',

    'store.title': 'Tienda',
    'store.loading': 'Cargando...',
    'store.empty': 'Productos Tubarão BJJ próximamente. Compra por WhatsApp/Instagram.',
    'store.variants': 'Variantes',
    'store.buyWhatsapp': 'Comprar por WhatsApp',
    'store.checkout': 'Pagar online',
    'store.checkoutLoading': 'Iniciando checkout...',
    'store.checkoutError': 'No fue posible iniciar el checkout en este momento.',

    'schedule.title': 'Horarios',
    'schedule.subtitle': 'Consulta los horarios de las clases por sede y día de la semana.',
    'schedule.loading': 'Cargando...',
    'schedule.empty': 'Horarios próximamente. Vuelve pronto o escríbenos por WhatsApp.',
    'schedule.unknownBranch': 'Sede',
    'schedule.instructorPrefix': 'Prof.',
    'schedule.day.0': 'Domingo',
    'schedule.day.1': 'Lunes',
    'schedule.day.2': 'Martes',
    'schedule.day.3': 'Miércoles',
    'schedule.day.4': 'Jueves',
    'schedule.day.5': 'Viernes',
    'schedule.day.6': 'Sábado',

    'footer.sendMessage': 'Enviar mensaje',
    'footer.placeholder.name': 'Nombre',
    'footer.placeholder.email': 'Email',
    'footer.placeholder.phone': 'Teléfono (opcional)',
    'footer.placeholder.message': 'Tu mensaje',
    'footer.sending': 'Enviando...',
    'footer.submitContact': 'Enviar mensaje',
    'footer.contactSuccess': '¡Mensaje enviado con éxito!',
    'footer.contactError': 'Error al enviar. Inténtalo de nuevo.',
    'footer.brand': 'GFTeam Tubarão',
    'footer.tagline': 'GFTeam Tubarão',
    'footer.quickLinks': 'Enlaces rápidos',
    'footer.contactSection': 'Contacto',
    'footer.newsletter': 'Newsletter',
    'footer.placeholder.newsletterEmail': 'Tu email',
    'footer.newsletterSuccess': '¡Inscripción realizada con éxito!',
    'footer.subscribe': 'Suscribirse',
    'footer.copyright': '© {year} GFTeam Tubarão. Todos los derechos reservados.',
    'footer.privacy': 'Política de privacidad',
    'legal.bannerText':
      'Usamos tus datos para mejorar tu experiencia y registrar consentimientos legales.',
    'legal.privacy': 'Política de Privacidad',
    'legal.terms': 'Términos de Uso',
    'legal.accept': 'Aceptar y continuar',
    'legal.later': 'Después',
    'legal.saving': 'Guardando...',
    'legal.close': 'Cerrar',
    'legal.notAvailable': 'Contenido no disponible en este momento.',
  },
}

export const SUPPORTED_LANGS = ['pt', 'en', 'es']
