/**
 * Interactive MCQ quizzes keyed by problem code.
 * Graded client-side after the student submits.
 */

const CP_L25_QUIZ = {
    problemCode: 'CP.L2.5',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa: 'რა მოხდება თუ ჩამრთველით ჩავრთავთ წრედს?',
            promptEn: 'What happens when you turn the circuit on with the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა',
                    textEn: 'The red LED lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი აინთება ნელა',
                    textEn: 'The green LED lights up slowly',
                },
                {
                    key: 'გ',
                    textKa: 'წითელი შუქდიოდი აინთება და ჩაქრება ნელა',
                    textEn: 'The red LED lights up and fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'არც ერთი შუქდიოდი არ აინთება',
                    textEn: 'Neither LED lights up',
                },
                {
                    key: 'ე',
                    textKa: 'მწვანე შუქდიოდი აინთება და ჩაქრება ნელა',
                    textEn: 'The green LED lights up and fades slowly',
                },
            ],
            correctKey: 'ე',
            explanationKa:
                'ჩამრთველის ჩართვისას კონდესატორი იწყებს დამუხტვას მწვანე შტოს გავლით (A–B). '
                + 'დამუხტვისას დენი მაღალია — მწვანე აინთება, შემდეგ კონდესატორი ივსება და დენი იკლებს — მწვანე ნელა ჩაქრება.',
            explanationEn:
                'Closing the switch starts charging the capacitor through the green branch (A–B). '
                + 'Charge current is high at first — green lights — then falls as the capacitor fills — green fades.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადავრთავთ გადამრთველს?',
            promptEn: 'How do the LEDs change when you toggle the slide switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე ჩაქრება, წითელი აინთება ნელა',
                    textEn: 'Green goes out; red lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე ჩაქრება ნელა, წითელი აინთება ჩქარა',
                    textEn: 'Green fades slowly; red lights up quickly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე ჩაქრება, წითელი აინთება და ნელა ჩაქრება',
                    textEn: 'Green goes out; red lights up and fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'მწვანე დარჩება ანთებული და წითელი აინთება',
                    textEn: 'Green stays lit and red also lights',
                },
                {
                    key: 'ე',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'გ',
            explanationKa:
                'გადამრთველი A–C-ზე გადააქვს კონდესატორს წითელ შტოზე. მწვანე შტო იშლება — მწვანე ჩაქრება. '
                + 'დამუხტული კონდესატორი იწყებს განმუხტვას წითელი შუქდიოდის გავლით — წითელი აინთება და ნელა ჩაქრება.',
            explanationEn:
                'Sliding to A–C connects the capacitor to the red branch. The green path opens — green goes out. '
                + 'The charged capacitor discharges through the red LED — red lights, then fades as charge leaves.',
        },
        {
            id: 'q3',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადამრთველს დავაბრუნებთ უკან?',
            promptEn: 'How do the LEDs change when you slide the switch back?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე აინთება ნელა, წითელი ჩაქრება ნელა',
                    textEn: 'Green lights slowly; red fades slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე აინთება და ჩაქრება ნელა, წითელი ჩაქრება',
                    textEn: 'Green lights and fades slowly; red goes out',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე აინთება ნელა და ჩაქრება, წითელი ჩაქრება ნელა',
                    textEn: 'Green lights slowly and fades; red fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'უკან A–B-ზე დაბრუნებისას წითელი შტო იშლება — წითელი ჩაქრება. '
                + 'კონდესატორი ისევ იწყებს დამუხტვას მწვანე შტოთი — მწვანე აინთება და შემდეგ ნელა ჩაქრება.',
            explanationEn:
                'Sliding back to A–B opens the red path — red goes out. '
                + 'The capacitor charges again through green — green lights, then fades as it fills.',
        },
    ],
};

const CP_L26_QUIZ = {
    problemCode: 'CP.L2.6',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa: 'რა მოხდება თუ ჩამრთველით ჩავრთავთ წრედს?',
            promptEn: 'What happens when you turn the circuit on with the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა',
                    textEn: 'The red LED lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი აინთება და ჩაქრება ნელა',
                    textEn: 'The green LED lights up and fades slowly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე შუქდიოდი აინთება ჩქარა',
                    textEn: 'The green LED lights up quickly',
                },
                {
                    key: 'დ',
                    textKa: 'წითელი შუქდიოდი აინთება ჩქარა',
                    textEn: 'The red LED lights up quickly',
                },
                {
                    key: 'ე',
                    textKa: 'არც ერთი შუქდიოდი არ აინთება',
                    textEn: 'Neither LED lights up',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'ჩამრთველის ჩართვის შემდეგ კონდესატორი დაიწყებს დამუხტვას მხოლოდ მწვანე შუქდიოდის გავლით — '
                + 'წითელი დენის საწინააღმდეგო მიმართულებითაა ჩართული. დენი თავიდან მაღალია, '
                + 'მწვანე აინთება, შემდეგ კონდესატორის დამუხტვასთან ერთად ნათება ნელა ქრება.',
            explanationEn:
                'After closing the switch the capacitor charges through the green LED only — '
                + 'the red LED is reverse-biased. Current is high at first so green lights, '
                + 'then fades as the capacitor finishes charging.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადავრთავთ გადამრთველს?',
            promptEn: 'How do the LEDs change when you toggle the slide switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე ჩაქრება, წითელი აინთება ნელა',
                    textEn: 'Green goes out; red lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე ჩაქრება ნელა, წითელი აინთება ჩქარა',
                    textEn: 'Green fades slowly; red lights up quickly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე დარჩება ანთებული და წითელი აინთება',
                    textEn: 'Green stays lit and red also lights',
                },
                {
                    key: 'დ',
                    textKa: 'მწვანე დარჩება ჩამყრალი, წითელი აინთება და ჩაქრება ნელა',
                    textEn: 'Green stays off; red lights up and fades slowly',
                },
                {
                    key: 'ე',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'დ',
            explanationKa:
                'გადამრთველის გადართვის შემდეგ იცვლება კვების პოლარობა — კონდესატორი ჯერ განიმუხტება, '
                + 'შემდეგ საპირისპირო პოლარობით დაიმუხტება. დენი მხოლოდ წითელ შუქდიოდში გაივლის: '
                + 'წითელი აინთება მკვეთრად და ნელა ჩაქრება გადამუხტვისას.',
            explanationEn:
                'Toggling the slide reverses supply polarity — the capacitor discharges then recharges '
                + 'with opposite polarity. Current flows only through the red LED: red flashes on, '
                + 'then fades as recharging completes.',
        },
        {
            id: 'q3',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადამრთველს დავაბრუნებთ უკან?',
            promptEn: 'How do the LEDs change when you slide the switch back?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე აინთება და ჩაქრება ნელა, წითელი დარჩა ჩამყრალი',
                    textEn: 'Green lights and fades slowly; red stays off',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე აინთება, წითელი ჩაქრება ნელა',
                    textEn: 'Green lights; red fades slowly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე აინთება ნელა, წითელი ჩაქრება ნელა',
                    textEn: 'Green lights slowly; red fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'გადამრთველის უკან დაბრუნების შემდეგ ისევ იცვლება პოლარობა — კონდესატორი '
                + 'გადამუხტვას იწყებს, დენი მხოლოდ მწვანე შუქდიოდში გაივლის: მწვანე აინთება '
                + 'მკვეთრად და თანდათან ჩაქრება; წითელი რჩება ჩამყრალი.',
            explanationEn:
                'Sliding back reverses polarity again — the capacitor recharges and current flows '
                + 'only through green: green flashes on then fades; red stays off.',
        },
    ],
};

const CP_L27_QUIZ = {
    problemCode: 'CP.L2.7',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa: 'რა მოხდება თუ ჩამრთველით ჩავრთავთ წრედს?',
            promptEn: 'What happens when you turn the circuit on with the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა',
                    textEn: 'The red LED lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი აინთება მყისიერად',
                    textEn: 'The green LED lights up instantly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე შუქდიოდი აინთება ნელა',
                    textEn: 'The green LED lights up slowly',
                },
                {
                    key: 'დ',
                    textKa: 'წითელი შუქდიოდი აინთება მყისიერად',
                    textEn: 'The red LED lights up instantly',
                },
                {
                    key: 'ე',
                    textKa: 'არც ერთი შუქდიოდი არ აინთება',
                    textEn: 'Neither LED lights up',
                },
            ],
            correctKey: 'გ',
            explanationKa:
                'პარალელურად ჩართული კონდესატორი დაიწყებს დამუხტვას და მასზე ძაბვა თანდათან მოიმატებს. '
                + 'ძაბვასთან ერთად მწვანე შუქდიოდის ნათებაც იზრდება. წითელი შებრუნებითაა ჩართული — '
                + 'მასში დენი არ გაივლის.',
            explanationEn:
                'The parallel capacitor charges and voltage across it rises gradually. '
                + 'Green brightness rises with that voltage. Red is reverse-biased, so it stays off.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადავრთავთ გადამრთველს?',
            promptEn: 'How do the LEDs change when you toggle the slide switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე ჩაქრება, წითელი აინთება ნელა',
                    textEn: 'Green goes out; red lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე ჩაქრება ნელა, წითელი აინთება მყისიერად',
                    textEn: 'Green fades slowly; red lights instantly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე დარჩება ანთებული და წითელი აინთება',
                    textEn: 'Green stays lit and red also lights',
                },
                {
                    key: 'დ',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
                {
                    key: 'ე',
                    textKa: 'მწვანე ჩაქრება ნელა და ამის შემდეგ წითელი აინთება ნელა',
                    textEn: 'Green fades slowly, then red lights up slowly',
                },
            ],
            correctKey: 'ე',
            explanationKa:
                'გადამრთველის გადართვისას იცვლება კვების პოლარობა — კონდესატორი გადაიმუხტება '
                + '(ძაბვა ჯერ მოიკლებს, განულდება, შემდეგ საპირისპირო პოლარობით გაიზრდება). '
                + 'ჯერ მწვანე ნელა ჩაქრება, შემდეგ წითელი ნელა აინთება.',
            explanationEn:
                'Toggling reverses supply polarity — the capacitor recharges through zero to the '
                + 'opposite polarity. Green fades slowly first, then red rises slowly.',
        },
        {
            id: 'q3',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადამრთველს დავაბრუნებთ უკან?',
            promptEn: 'How do the LEDs change when you slide the switch back?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი ჩაქრება ნელა და შემდეგ მწვანე აინთება ნელა',
                    textEn: 'Red fades slowly, then green lights up slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე აინთება და შემდეგ წითელი ჩაქრება ნელა',
                    textEn: 'Green lights, then red fades slowly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე აინთება ნელა, წითელი ჩაქრება ნელა',
                    textEn: 'Green lights slowly; red fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'უკან დაბრუნებისას ისევ იცვლება პოლარობა და კონდესატორი გადაიმუხტება — '
                + 'ჯერ წითელი ნელა ჩაქრება, შემდეგ მწვანე ნელა აინთება.',
            explanationEn:
                'Sliding back reverses polarity again — red fades slowly first, then green rises slowly.',
        },
        {
            id: 'q4',
            promptKa: 'რა მოხდება თუ ჩამრთველს გავთიშავთ?',
            promptEn: 'What happens when you turn the master switch off?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე შუქდიოდი ჩაქრება მყისიერად',
                    textEn: 'The green LED goes out instantly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი ჩაქრება ნელა',
                    textEn: 'The green LED fades slowly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე შუქდიოდი ჩაქრება ნელა და შემდეგ წითელი აინთება ნელა',
                    textEn: 'Green fades slowly, then red lights up slowly',
                },
                {
                    key: 'დ',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'ჩამრთველის გამორთვის შემდეგ ბოლო ანთებული შუქდიოდი რჩება ანთებული, '
                + 'სანამ კონდესატორი მის გავლით განიმუხტება — მწვანე ნელა ჩაქრება.',
            explanationEn:
                'After opening the switch the last-lit LED stays on while the parallel capacitor '
                + 'discharges through it — green fades slowly.',
        },
    ],
};

const CP_L212_QUIZ = {
    problemCode: 'CP.L2.12',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa: 'რა მოხდება თუ ჩამრთველით ჩავრთავთ წრედს?',
            promptEn: 'What happens when you turn the circuit on with the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი შუქდიოდი აინთება მყისიერად',
                    textEn: 'The red LED lights up instantly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი აინთება მყისიერად',
                    textEn: 'The green LED lights up instantly',
                },
                {
                    key: 'გ',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა და ჩაქრება',
                    textEn: 'The red LED lights up slowly and goes out',
                },
                {
                    key: 'დ',
                    textKa: 'მწვანე შუქდიოდი აინთება ნელა და ჩაქრება ნელა',
                    textEn: 'The green LED lights up slowly and fades slowly',
                },
                {
                    key: 'ე',
                    textKa: 'მწვანე შუქდიოდი აინთება მყისიერად და ჩაქრება ნელა',
                    textEn: 'The green LED lights brightly then fades slowly',
                },
            ],
            correctKey: 'ე',
            explanationKa:
                'ჩამრთველის ჩართვის შემდეგ კვებასთან მიერთებული კონდესატორები იწყებენ დამუხტვას '
                + 'მხოლოდ მწვანე შუქდიოდის გავლით (წითელი საწინააღმდეგოდაა ჩართული). სანამ '
                + 'კონდესატორები დაიმუხტება, მწვანე თავიდან ძლიერად აინთება, შემდეგ ნათება '
                + 'იკლებს და ჩაქრება.',
            explanationEn:
                'After closing the switch the series capacitors charge only through the green LED '
                + '(red is reverse-biased). Green lights brightly at first, then fades as charging finishes.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადავრთავთ გადამრთველს?',
            promptEn: 'How do the LEDs change when you toggle the slide switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'წითელი შუქდიოდი აინთება მყისიერად და ჩაქრება ნელა',
                    textEn: 'The red LED lights brightly then fades slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა და ჩაქრება მყისიერად',
                    textEn: 'The red LED lights slowly then goes out instantly',
                },
                {
                    key: 'გ',
                    textKa: 'მწვანე შუქდიოდი აინთება მყისიერად',
                    textEn: 'The green LED lights up instantly',
                },
                {
                    key: 'დ',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა და ჩაქრება ნელა',
                    textEn: 'The red LED lights slowly and fades slowly',
                },
                {
                    key: 'ე',
                    textKa: 'მწვანე შუქდიოდი აინთება ნელა და დარჩება ანთებული',
                    textEn: 'The green LED lights slowly and stays on',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'გადამრთველის გადართვისას იცვლება კვების პოლარობა — კონდესატორები რევერსულად '
                + 'გადაიმუხტება. დენი მიდის მხოლოდ წითელი შუქდიოდით: ის მყისიერად აინთება და '
                + 'გადამუხტვისას ნელა ჩაქრება.',
            explanationEn:
                'Toggling the slide reverses polarity so the capacitors recharge the other way. '
                + 'Current flows only through the red LED — it lights brightly then fades.',
        },
        {
            id: 'q3',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ გადამრთველს დავაბრუნებთ უკან?',
            promptEn: 'How do the LEDs change when you toggle the slide switch back?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მწვანე შუქდიოდი აინთება ნელა და ჩაქრება ნელა',
                    textEn: 'The green LED lights slowly and fades slowly',
                },
                {
                    key: 'ბ',
                    textKa: 'მწვანე შუქდიოდი აინთება მყისიერად და ჩაქრება ნელა',
                    textEn: 'The green LED lights brightly then fades slowly',
                },
                {
                    key: 'გ',
                    textKa: 'წითელი შუქდიოდი აინთება მყისიერად და ჩაქრება ნელა',
                    textEn: 'The red LED lights brightly then fades slowly',
                },
                {
                    key: 'დ',
                    textKa: 'წითელი შუქდიოდი აინთება ნელა და ჩაქრება მყისიერად',
                    textEn: 'The red LED lights slowly then goes out instantly',
                },
                {
                    key: 'ე',
                    textKa: 'არაფერი არ შეიცვლება',
                    textEn: 'Nothing changes',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'გადამრთველის უკან დაბრუნებისას პოლარობა ისევ იცვლება — კონდესატორები თავიდან '
                + 'გადაიმუხტება მწვანე შუქდიოდით: მწვანე მყისიერად აინთება და თანდათან ჩაქრება.',
            explanationEn:
                'Toggling back reverses polarity again. The capacitors recharge through green — '
                + 'green lights brightly then fades.',
        },
    ],
};

const CP_L216_QUIZ = {
    problemCode: 'CP.L2.16',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa: 'როგორ შეიცვლება წრედის მუშაობის პრინციპი თუ წინაღობებს გავზრდით?',
            promptEn: 'How does the circuit behavior change if we increase the resistances?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ნათების ცვლილება უფრო სწრაფი გახდება',
                    textEn: 'Brightness changes become faster',
                },
                {
                    key: 'ბ',
                    textKa: 'ნათების ცვლილება უფრო ნელი გახდება (RC მეტია)',
                    textEn: 'Brightness changes become slower (larger RC)',
                },
                {
                    key: 'გ',
                    textKa: 'შუქდიოდი საერთოდ აღარ აინთება',
                    textEn: 'The LED never lights',
                },
                {
                    key: 'დ',
                    textKa: 'კონდესატორი აღარ იმუხტება',
                    textEn: 'The capacitor no longer charges',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'უფრო დიდი წინაღობა ზრდის RC დროის მუდმივას, ამიტომ კონდესატორის დამუხტვა/'
                + 'განმუხტვა უფრო ნელია და ნათებაც უფრო ნელა იცვლება.',
            explanationEn:
                'Higher resistance increases the RC time constant, so the capacitor charges/'
                + 'discharges more slowly and brightness changes more gradually.',
        },
        {
            id: 'q2',
            promptKa:
                'როგორ შეიცვლება წრედის მუშაობის პრინციპი თუ კონდესატორს საერთოდ ამოიღებთ წრედიდან?',
            promptEn:
                'How does the circuit behavior change if you remove the capacitor entirely?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ნათება კვლავ თანდათან შეიცვლება',
                    textEn: 'Brightness still changes gradually',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდი საერთოდ აღარ აინთება',
                    textEn: 'The LED never lights',
                },
                {
                    key: 'გ',
                    textKa: 'ნათება მყისიერად შეიცვლება გადამრთველის გადართვისას',
                    textEn: 'Brightness jumps instantly when the switch is toggled',
                },
                {
                    key: 'დ',
                    textKa: 'ნათება მხოლოდ გაიზრდება, შემცირება აღარ მოხდება',
                    textEn: 'Brightness only increases; it never decreases',
                },
            ],
            correctKey: 'გ',
            explanationKa:
                'კონდესატორი ქმნის რბილ გადასვლას. მის გარეშე ძაბვა შუქდიოდზე მყისიერად '
                + 'იცვლება გადამრთველთან ერთად.',
            explanationEn:
                'The capacitor softens the transition. Without it, LED voltage (and brightness) '
                + 'jumps immediately with the switch.',
        },
    ],
};

const QUIZZES_BY_CODE = {
    'CP.L2.5': CP_L25_QUIZ,
    'CP.L2.6': CP_L26_QUIZ,
    'CP.L2.7': CP_L27_QUIZ,
    'CP.L2.12': CP_L212_QUIZ,
    'CP.L2.16': CP_L216_QUIZ,
};

export function getQuizForProblem(problemCode) {
    return QUIZZES_BY_CODE[problemCode] ?? null;
}

export function hasInteractiveQuiz(problemCode) {
    return getQuizForProblem(problemCode) != null;
}
