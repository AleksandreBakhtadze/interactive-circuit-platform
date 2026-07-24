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

const LR_L213_QUIZ = {
    problemCode: 'LR.L2.13',
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
                    textKa: 'შუქდიოდი აინთება',
                    textEn: 'The LED lights up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდი არ აინთება',
                    textEn: 'The LED does not light up',
                },
                {
                    key: 'გ',
                    textKa: 'შუქდიოდი იციმციმებს',
                    textEn: 'The LED blinks',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ჩამრთველის ჩართვის შემდეგ ზედა რეზისტორის გავლით შუქდიოდში გაივლის დენი.',
            explanationEn:
                'After the switch is closed, current flows through the upper resistor and the LED.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდის ნათება თუ დავაწვებით ღილაკს?',
            promptEn: 'How does the LED brightness change when the button is pressed?',
            options: [
                {
                    key: 'ა',
                    textKa: 'მოიმატებს',
                    textEn: 'It increases',
                },
                {
                    key: 'ბ',
                    textKa: 'მოიკლებს',
                    textEn: 'It decreases',
                },
                {
                    key: 'გ',
                    textKa: 'არ შეიცვლება',
                    textEn: 'It does not change',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'კვებების შეერთების წერტილში არის 3 ვ, ხოლო შუქდიოდზე მოდებულია დაახლოებით 1.8 ვ. '
                + 'ღილაკზე დაჭერისას დენი მაღალი ძაბვიდან დაბლისკენ გაივლის და ეს ნაკადი '
                + 'შუქდიოდში უკვე გამავალ დენს დაემატება.',
            explanationEn:
                'The supply midpoint is at 3 V while the LED is at about 1.8 V. '
                + 'Pressing the button adds current flowing from the higher-voltage point '
                + 'to the LED branch, increasing its brightness.',
        },
        {
            id: 'q3',
            promptKa: 'რა მოხდება თუ ჩამრთველის ჩართვის გარეშე დავაწვებით ღილაკს?',
            promptEn: 'What happens if the button is pressed without turning on the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'შუქდიოდი არ აინთება',
                    textEn: 'The LED does not light up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდი აინთება',
                    textEn: 'The LED lights up',
                },
                {
                    key: 'გ',
                    textKa: 'მოხდება მოკლე ჩართვა',
                    textEn: 'A short circuit occurs',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'ქვედა კვების წყაროდან ღილაკისა და რეზისტორის გავლით დენი შუქდიოდში გაივლის.',
            explanationEn:
                'Current from the lower power supply flows through the button and resistor into the LED.',
        },
    ],
};

const LR_L214_QUIZ = {
    problemCode: 'LR.L2.14',
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
                    textKa: 'შუქდიოდები აინთება',
                    textEn: 'The LEDs light up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდები არ აინთება',
                    textEn: 'The LEDs do not light up',
                },
                {
                    key: 'გ',
                    textKa: 'ერთი შუქდიოდი აინთება, მეორე არა',
                    textEn: 'One LED lights up, the other does not',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ჩამრთველის ჩართვის შემდეგ რეზისტორის გავლით შუქდიოდებში გაივლის დენი.',
            explanationEn:
                'After the switch is closed, current flows through the resistor and both LEDs.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ დავაწვებით ღილაკს?',
            promptEn: 'How does the LED brightness change when the button is pressed?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ორივე შუქდიოდის ნათება მოიკლებს',
                    textEn: 'Both LEDs get dimmer',
                },
                {
                    key: 'ბ',
                    textKa: 'ორივე შუქდიოდის ნათება მოიმატებს',
                    textEn: 'Both LEDs get brighter',
                },
                {
                    key: 'გ',
                    textKa: 'ერთი შუქდიოდის ნათება მოიკლებს, მეორის მოიმატებს',
                    textEn: 'One LED dims while the other brightens',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'კვებების შეერთების წერტილში არის 3 ვ, ხოლო ორ მიმდევრობით ჩართულ შუქდიოდზე მოდებულია '
                + 'დაახლოებით 3.6 ვ. ღილაკზე დაჭერისას დენი მაღალი ძაბვიდან დაბლისკენ გაივლის და ეს '
                + 'ნაკადი გამოაკლდება შუქდიოდებში გამავალ დენს.',
            explanationEn:
                'The supply midpoint is at 3 V while the two series LEDs need about 3.6 V. '
                + 'Pressing the button diverts current from high to low potential, subtracting '
                + 'from the current through the LEDs.',
        },
        {
            id: 'q3',
            promptKa: 'რა მოხდება თუ ჩამრთველის ჩართვის გარეშე დავაწვებით ღილაკს?',
            promptEn: 'What happens if the button is pressed without turning on the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'შუქდიოდები აინთება',
                    textEn: 'The LEDs light up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდები არ აინთება',
                    textEn: 'The LEDs do not light up',
                },
                {
                    key: 'გ',
                    textKa: 'ერთი შუქდიოდი აინთება, მეორე არა',
                    textEn: 'One LED lights up, the other does not',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'ქვედა კვების წყაროდან ღილაკისა და რეზისტორის გავლით დენი ვერ გაივლის შუქდიოდებში, '
                + 'რადგან ორ მიმდევრობით ჩართულ წითელ შუქდიოდს ასანთებად სჭირდება მინიმუმ 3.4 ვ.',
            explanationEn:
                'Current from the lower supply through the button and resistor cannot light the LEDs, '
                + 'because two series red LEDs need at least about 3.4 V to turn on.',
        },
    ],
};

const LR_L215_QUIZ = {
    problemCode: 'LR.L2.15',
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
                    textKa: 'ორივე შუქდიოდი აინთება',
                    textEn: 'Both LEDs light up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდები არ აინთება',
                    textEn: 'The LEDs do not light up',
                },
                {
                    key: 'გ',
                    textKa: 'ერთი შუქდიოდი აინთება, მეორე არა',
                    textEn: 'One LED lights up, the other does not',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ჩამრთველის ჩართვის შემდეგ რეზისტორის გავლით შუქდიოდებში გაივლის დენი.',
            explanationEn:
                'After the switch is closed, current flows through the resistor and both LEDs.',
        },
        {
            id: 'q2',
            promptKa: 'როგორ შეიცვლება შუქდიოდების ნათება თუ დავაწვებით ღილაკს?',
            promptEn: 'How does the LED brightness change when the button is pressed?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ორივე შუქდიოდის ნათება მოიკლებს',
                    textEn: 'Both LEDs get dimmer',
                },
                {
                    key: 'ბ',
                    textKa: 'ორივე შუქდიოდის ნათება მოიმატებს',
                    textEn: 'Both LEDs get brighter',
                },
                {
                    key: 'გ',
                    textKa: 'არ შეიცვლება',
                    textEn: 'It does not change',
                },
                {
                    key: 'დ',
                    textKa: 'ზედა შუქდიოდის ნათება მოიკლებს, ქვედასი მოიმატებს',
                    textEn: 'The top LED dims while the bottom LED brightens',
                },
                {
                    key: 'ე',
                    textKa: 'ზედა შუქდიოდის ნათება მოიმატებს, ქვედასი მოიკლებს',
                    textEn: 'The top LED brightens while the bottom LED dims',
                },
            ],
            correctKey: 'დ',
            explanationKa:
                'კვებების შეერთების წერტილში არის 3 ვ, ხოლო შუქდიოდების შეერთების წერტილში დაახლოებით 1.8 ვ. '
                + 'ღილაკზე დაჭერისას დენი მაღალი ძაბვიდან დაბლისკენ გაივლის — ეს ნაკადი დაემატება ქვედა '
                + 'შუქდიოდის დენს და გამოაკლდება ზედა შუქდიოდის დენს.',
            explanationEn:
                'The supply midpoint is at 3 V while the node between the LEDs is about 1.8 V. '
                + 'Pressing the button sends current from high to low potential — it adds to the bottom '
                + 'LED current and subtracts from the top LED current.',
        },
        {
            id: 'q3',
            promptKa: 'რა მოხდება თუ ჩამრთველის ჩართვის გარეშე დავაწვებით ღილაკს?',
            promptEn: 'What happens if the button is pressed without turning on the switch?',
            options: [
                {
                    key: 'ა',
                    textKa: 'შუქდიოდები აინთება',
                    textEn: 'The LEDs light up',
                },
                {
                    key: 'ბ',
                    textKa: 'შუქდიოდები არ აინთება',
                    textEn: 'The LEDs do not light up',
                },
                {
                    key: 'გ',
                    textKa: 'ქვედა შუქდიოდი აინთება, ზედა არა',
                    textEn: 'The bottom LED lights up, the top does not',
                },
            ],
            correctKey: 'გ',
            explanationKa:
                'ქვედა კვების წყაროდან ღილაკისა და რეზისტორის გავლით დენი გაივლის მხოლოდ ქვედა შუქდიოდში.',
            explanationEn:
                'Current from the lower supply through the button and resistor flows only through the bottom LED.',
        },
        {
            id: 'q4',
            promptKa:
                'შეიცვლება თუ არა წრედის მუშაობის პრინციპი ღილაკზე დაჭერისას, '
                + 'თუ ქვედა წითელ შუქდიოდს ჩავანაცვლებთ მწვანით?',
            promptEn:
                'Does the circuit behavior on button press change if the bottom red LED '
                + 'is replaced with a green one?',
            options: [
                {
                    key: 'ა',
                    textKa: 'შეიცვლება',
                    textEn: 'Yes, it changes',
                },
                {
                    key: 'ბ',
                    textKa: 'არ შეიცვლება',
                    textEn: 'No, it does not change',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'მწვანე შუქდიოდის სამუშაო ძაბვა იმდენად არ განსხვავდება წითელი შუქდიოდის ძაბვისგან, '
                + 'რომ 3 ვ კვების წყაროებზე დენმა სხვა მიმართულებით დაიწყოს მოძრაობა.',
            explanationEn:
                'A green LED’s forward voltage does not differ from a red one enough to reverse '
                + 'the direction of current flow on the 3 V supplies.',
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

const VR_L110_QUIZ = {
    problemCode: 'VR.L1.10',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa:
                'რა მოხდება თუ ცოციას დავაყენებთ შუა წერტილში და ჩამრთველით ჩავრთავთ წრედს?',
            promptEn:
                'What happens if you set the wiper to mid-point and turn the switch on?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ნათურა აინთება ძლიერად',
                    textEn: 'The lamp lights brightly',
                },
                {
                    key: 'ბ',
                    textKa: 'ნათურა აინთება სუსტად',
                    textEn: 'The lamp lights dimly',
                },
                {
                    key: 'გ',
                    textKa: 'ნათურა არ აინთება',
                    textEn: 'The lamp does not light',
                },
            ],
            correctKey: 'გ',
            explanationKa:
                'ნათურაში გაივლის ძალიან სუსტი დენი (ცვლადი რეზისტორის ნახევარი ≈ 5 kΩ), '
                + 'რაც საკმარისი არ იქნება მის ასანთებად.',
            explanationEn:
                'Only a very small current flows through the lamp (about half of the 10 kΩ pot), '
                + 'which is not enough to light it.',
        },
        {
            id: 'q2',
            promptKa:
                'რა მოხდება თუ ცოციას გადავაადგილებთ კვებასთან ჩართული პოლუსისკენ?',
            promptEn:
                'What happens if you move the wiper toward the end connected to the supply?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ნათურა არ აინთება',
                    textEn: 'The lamp does not light',
                },
                {
                    key: 'ბ',
                    textKa: 'ნათურა აინთება ძლიერად',
                    textEn: 'The lamp lights brightly',
                },
                {
                    key: 'გ',
                    textKa: 'ნათურა აინთება სუსტად',
                    textEn: 'The lamp lights dimly',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ცვლად რეზისტორს გააჩნია დაახლოებით 50 Ω დამცავი (ბოლო) წინაღობა, '
                + 'შესაბამისად მასში არ გაივლის ნათურის ასანთებად საკმარისი დენი.',
            explanationEn:
                'The kit potentiometer has about 50 Ω of end-stop / protective resistance, '
                + 'so even at minimum the current is still too low to light the lamp.',
        },
        {
            id: 'q3',
            promptKa: 'რა მოხდება თუ ნათურას ჩავანაცვლებთ ძრავით?',
            promptEn: 'What happens if you replace the lamp with a motor?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ძრავი არ დატრიალდება',
                    textEn: 'The motor will not spin',
                },
                {
                    key: 'ბ',
                    textKa: 'ძრავი დატრიალდება ნელა',
                    textEn: 'The motor will spin slowly',
                },
                {
                    key: 'გ',
                    textKa: 'ძრავი დატრიალდება ჩქარა',
                    textEn: 'The motor will spin quickly',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ცვლად რეზისტორს გააჩნია დაახლოებით 50 Ω დამცავი წინაღობა, '
                + 'შესაბამისად მასში არ გაივლის ძრავის დასატრიალებლად საკმარისი დენი.',
            explanationEn:
                'With the pot’s ~50 Ω protective floor, the current is still too small '
                + 'to spin the motor.',
        },
    ],
};

const VR_L211_QUIZ = {
    problemCode: 'VR.L2.11',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa:
                'რა მოხდება თუ ცოციას დავაყენებთ შუა წერტილში და ჩამრთველით ჩავრთავთ წრედს?',
            promptEn:
                'What happens if you set the wiper mid-way and turn the switch on?',
            options: [
                {
                    key: 'ა',
                    textKa: 'არც ერთი არ აინთება',
                    textEn: 'Nothing lights',
                },
                {
                    key: 'ბ',
                    textKa: 'ნათურაც და შუქდიოდებიც აინთება',
                    textEn: 'The lamp and both LEDs light',
                },
                {
                    key: 'გ',
                    textKa: 'მხოლოდ შუქდიოდები აინთება',
                    textEn: 'Only the LEDs light',
                },
                {
                    key: 'დ',
                    textKa: 'მხოლოდ მწვანე შუქდიოდი აინთება',
                    textEn: 'Only the green LED lights',
                },
                {
                    key: 'ე',
                    textKa: 'მხოლოდ წითელი შუქდიოდი აინთება',
                    textEn: 'Only the red LED lights',
                },
            ],
            correctKey: 'დ',
            explanationKa:
                'მხოლოდ მწვანე შუქდიოდი აინთება. ნათურაში საკმარისი დენი ვერ გაივლის; '
                + 'წითელ შუქდიოდზე საკმარისი ძაბვა არ იქნება მოდებული.',
            explanationEn:
                'Only the green LED lights. The lamp does not get enough current, '
                + 'and the red LED does not get enough voltage from the mid wiper.',
        },
        {
            id: 'q2',
            promptKa: 'რა მოხდება თუ ცოციას გადავაადგილებთ ზევით?',
            promptEn: 'What happens if you move the wiper upward?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ნათურაც და შუქდიოდებიც აინთება',
                    textEn: 'The lamp and both LEDs light',
                },
                {
                    key: 'ბ',
                    textKa: 'მხოლოდ შუქდიოდები აინთება',
                    textEn: 'Only the LEDs light',
                },
                {
                    key: 'გ',
                    textKa: 'მხოლოდ მწვანე შუქდიოდი აინთება',
                    textEn: 'Only the green LED lights',
                },
                {
                    key: 'დ',
                    textKa: 'მხოლოდ ნათურა აინთება',
                    textEn: 'Only the lamp lights',
                },
                {
                    key: 'ე',
                    textKa: 'მხოლოდ წითელი შუქდიოდი აინთება',
                    textEn: 'Only the red LED lights',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'მწვანე და წითელი შუქდიოდები აინთება; ნათურა არ აინთება, '
                + 'რადგან მასში საკმარისი დენი ვერ გაივლის.',
            explanationEn:
                'Green and red LEDs light; the lamp still does not get enough current to glow.',
        },
        {
            id: 'q3',
            promptKa: 'რა მოხდება თუ ცოციას გადავაადგილებთ ქვევით?',
            promptEn: 'What happens if you move the wiper downward?',
            options: [
                {
                    key: 'ა',
                    textKa: 'არც ერთი არ აინთება',
                    textEn: 'Nothing lights',
                },
                {
                    key: 'ბ',
                    textKa: 'მხოლოდ შუქდიოდები აინთება',
                    textEn: 'Only the LEDs light',
                },
                {
                    key: 'გ',
                    textKa: 'მხოლოდ წითელი შუქდიოდი აინთება',
                    textEn: 'Only the red LED lights',
                },
                {
                    key: 'დ',
                    textKa: 'მხოლოდ მწვანე შუქდიოდი აინთება',
                    textEn: 'Only the green LED lights',
                },
                {
                    key: 'ე',
                    textKa: 'ნათურაც და შუქდიოდებიც აინთება',
                    textEn: 'The lamp and both LEDs light',
                },
            ],
            correctKey: 'დ',
            explanationKa:
                'მხოლოდ მწვანე შუქდიოდი აინთება. ნათურაში საკმარისი დენი ვერ გაივლის; '
                + 'წითელ შუქდიოდზე საკმარისი ძაბვა არ იქნება მოდებული.',
            explanationEn:
                'Only the green LED lights. The lamp lacks current, and the red LED '
                + 'lacks enough voltage when the wiper is toward ground.',
        },
    ],
};

const TR_L29_QUIZ = {
    problemCode: 'TR.L2.9',
    titleKa: 'ტესტი',
    titleEn: 'Quiz',
    questions: [
        {
            id: 'q1',
            promptKa:
                'რა მოხდება თუ ორივე ცოციას დავაყენებთ განაპირა, ყველაზე ქვედა წერტილში და ჩამრთველით ჩავრთავთ წრედს?',
            promptEn:
                'What happens if both wipers are at the bottom extreme and you turn the switch on?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ორივე შუქდიოდი აინთება',
                    textEn: 'Both LEDs light',
                },
                {
                    key: 'ბ',
                    textKa: 'მხოლოდ ემიტერულის აინთება',
                    textEn: 'Only the emitter-follower LED lights',
                },
                {
                    key: 'გ',
                    textKa: 'მხოლოდ კოლექტორულის აინთება',
                    textEn: 'Only the collector-load LED lights',
                },
                {
                    key: 'დ',
                    textKa: 'არც ერთი არ აინთება',
                    textEn: 'Neither LED lights',
                },
            ],
            correctKey: 'დ',
            explanationKa:
                'არც ერთი შუქდიოდი არ აინთება, რადგან ორივე ტრანზისტორი არის დაკეტილი და დენს არ გაატარებს.',
            explanationEn:
                'Neither LED lights — both transistors are cut off and conduct no current.',
        },
        {
            id: 'q2',
            promptKa:
                'რა მოხდება თუ ორივე ცოციას თანაბრად გადავაადგილებთ ცენტრში?',
            promptEn: 'What happens if both wipers are moved equally to the center?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ემიტერული აინთება უფრო ძლიერად',
                    textEn: 'The emitter-follower LED is brighter',
                },
                {
                    key: 'ბ',
                    textKa: 'კოლექტორული აინთება უფრო ძლიერად',
                    textEn: 'The collector-load LED is brighter',
                },
                {
                    key: 'გ',
                    textKa: 'ორივე აინთება თანაბრად',
                    textEn: 'Both light equally',
                },
                {
                    key: 'დ',
                    textKa: 'არც ერთი არ აინთება',
                    textEn: 'Neither lights',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'კოლექტორული აინთება უფრო ძლიერად: კოლექტორული ჩართვის ტრანზისტორი გაიხსნება სრულად და '
                + 'შუქდიოდს მიაწვდის სრულ ძაბვას. ემიტერული ჩართვის ტრანზისტორი გაიხსნება ისე, რომ შუქდიოდს '
                + 'მიაწვდის მხოლოდ ნახევარ ძაბვას.',
            explanationEn:
                'The collector-load LED is brighter: that transistor saturates and delivers nearly full '
                + 'supply to the LED, while the emitter follower only passes roughly half the voltage.',
        },
        {
            id: 'q3',
            promptKa:
                'რა მოხდება თუ ორივე ცოციას თანაბრად გადავაადგილებთ განაპირა, ყველაზე ზედა წერტილში?',
            promptEn:
                'What happens if both wipers are moved equally to the top extreme?',
            options: [
                {
                    key: 'ა',
                    textKa: 'ორივე შუქდიოდი აინთება ძლიერად',
                    textEn: 'Both LEDs light brightly',
                },
                {
                    key: 'ბ',
                    textKa: 'ემიტერული აინთება უფრო ძლიერად',
                    textEn: 'The emitter-follower LED is brighter',
                },
                {
                    key: 'გ',
                    textKa: 'კოლექტორული აინთება უფრო ძლიერად',
                    textEn: 'The collector-load LED is brighter',
                },
                {
                    key: 'დ',
                    textKa: 'ორივე შუქდიოდი აინთება სუსტად',
                    textEn: 'Both LEDs light weakly',
                },
            ],
            correctKey: 'ა',
            explanationKa:
                'ორივე შუქდიოდი აინთება ძლიერად: კოლექტორული ჩართვა სრულად გაიხსნება და სრულ ძაბვას მიაწვდის '
                + 'შუქდიოდს; ემიტერული ჩართვაც ზედა წერტილში სრულ ძაბვას მიაწვდის შუქდიოდს.',
            explanationEn:
                'Both LEDs light brightly — the collector stage is fully on, and at the top wiper '
                + 'position the emitter follower also delivers nearly full voltage to its LED.',
        },
        {
            id: 'q4',
            promptKa:
                'როგორ შეიცვლება შუქდიოდების ნათება თუ ორივე ცოციას სინქრონულად გადავაადგილებთ ყველაზე ქვედა წერტილიდან ზევით?',
            promptEn:
                'How does brightness change if both wipers move synchronously from bottom to top?',
            options: [
                {
                    key: 'ა',
                    textKa: 'შუქდიოდების ნათება მოიმატებს სინქრონულად თანაბრად',
                    textEn: 'Brightness rises equally and in sync',
                },
                {
                    key: 'ბ',
                    textKa: 'კოლექტორული ჩართვის შუქდიოდი უფრო მალე მიაღწევს მაქსიმალურ ნათებას',
                    textEn: 'The collector-load LED reaches full brightness sooner',
                },
                {
                    key: 'გ',
                    textKa: 'ემიტერული ჩართვის შუქდიოდი უფრო მალე მიაღწევს მაქსიმალურ ნათებას',
                    textEn: 'The emitter-follower LED reaches full brightness sooner',
                },
                {
                    key: 'დ',
                    textKa: 'შუქდიოდების ნათება მოიკლებს სინქრონულად თანაბრად',
                    textEn: 'Brightness falls equally and in sync',
                },
            ],
            correctKey: 'ბ',
            explanationKa:
                'კოლექტორული ჩართვის შუქდიოდი უფრო მალე მიაღწევს მაქსიმალურ ნათებას: ბაზაზე მცირე ძაბვითაც კი '
                + 'ტრანზისტორი გაიხსნება სრულად. ემიტერულ ჩართვაში ძაბვა იზრდება თანდათან ცოციას შესაბამისად '
                + 'და მაქსიმუმს მხოლოდ ზედა წერტილში აღწევს.',
            explanationEn:
                'The collector-load LED reaches full brightness sooner — a small base voltage already '
                + 'saturates that stage. The emitter follower tracks the wiper more gradually and peaks '
                + 'only near the top.',
        },
    ],
};

const QUIZZES_BY_CODE = {
    'CP.L2.5': CP_L25_QUIZ,
    'CP.L2.6': CP_L26_QUIZ,
    'CP.L2.7': CP_L27_QUIZ,
    'LR.L2.13': LR_L213_QUIZ,
    'LR.L2.14': LR_L214_QUIZ,
    'LR.L2.15': LR_L215_QUIZ,
    'CP.L2.12': CP_L212_QUIZ,
    'VR.L1.10': VR_L110_QUIZ,
    'VR.L2.11': VR_L211_QUIZ,
    'TR.L2.9': TR_L29_QUIZ,
};

export function getQuizForProblem(problemCode) {
    return QUIZZES_BY_CODE[problemCode] ?? null;
}

export function hasInteractiveQuiz(problemCode) {
    return getQuizForProblem(problemCode) != null;
}
