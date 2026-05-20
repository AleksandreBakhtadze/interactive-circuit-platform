-- =============================================
-- init.sql for Circuit Simulator
-- =============================================

-- Drop tables if they exist (safe for development)
DROP TABLE IF EXISTS problem_required_components CASCADE;
DROP TABLE IF EXISTS problems CASCADE;

-- =============================================
-- Problems Table
-- =============================================
CREATE TABLE problems (
id BIGSERIAL PRIMARY KEY,
code VARCHAR(50) UNIQUE NOT NULL,
title VARCHAR(200) NOT NULL,
description TEXT,
hint TEXT,
questions TEXT,
methodology TEXT,
difficulty VARCHAR(50),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP
);

-- =============================================
-- Required Components (ElementCollection)
-- =============================================
CREATE TABLE problem_required_components (
problem_id BIGINT NOT NULL,
component_name VARCHAR(100) NOT NULL,
quantity INTEGER NOT NULL DEFAULT 1,
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- =============================================
-- Insert Georgian Problems
-- =============================================

INSERT INTO problems (code, title, description, hint,questions, methodology, difficulty) VALUES
                                                                      ('ST.L1.1',
                                                                       'ნათურის ანთება ღილაკით',
                                                                       'გამოიყენეთ მხოლოდ შემდეგი დეტალები : ღილაკი, ნათურა, კვების წყარო და გამტარები. ააწყვეთ წრედი , რომელიც იმუშავებს ასე : თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს.',
                                                                       'დენის ნაკადმა კვების დადებითი პოლუსიდან ჯერ ღილაკის და შემდეგ ნათურის გავლით უნდა გაიაროს კვების უარყოფით პოლუსისკენ.',
                                                                       'რა შეიცვლება თუ წრედის ასაწყობად გამოვიყენებთ უფრო გრძელ გამტარებს?',
                                                                       'ეს არსი პირველი, გაცნობითი სავარჯიშო. ამოცანის მიზანია, პრაქტიკულად ნახონ გამტარების გამოყენება, შეეჩვიონ დეტალების
წკაპებით დამაგრებას, გაიგონ წრედის შეკვრის მნიშვნელობა, უნდა მიხვდენ რომ გაწყვეტილ წრედში დენის ნაკადი არ მოძრაობს.',
                                                                       'beginner'),

                                                                      ('ST.L1.2',
                                                                       'ნათურის ანთება ღილაკით და ორი კვების წყაროთი',
                                                                       'გამოიყენეთ მხოლოდ შემდეგი დეტალები: ღილაკი, ნათურა, ორი კვების წყარო და გამტარები. ააწყვეთ წრედი, რომელიც იმუშავებს ასე: თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს. ეს არის წინა სავარჯიშოს მსგავსი ამოცანა იმ განსხავავებით, რომ ერთი კვების წყაროს ნაცვლად უნდა გამოიყენოთ ორი. წრედის აწყობის შემდეგ, აღწერეთ რა შეიცვალა წინა ამოცანასთან შედარებით და რამ გამოიწვია ეს ცვლილება?',
                                                                       'ერთი კვების წყაროს დადებითი პოლუსი მიაერთეთ მეორე კვების წყაროს უარყოფით პოლუსს. ნათურის ასანთებად გამოიყენეთ დარჩენილი თავისუფალი პოლუსები.',
                                                                       'როგორ იმუშავებს წრედი თუ ნათურას ჩავრთავთ კვების წყაროებს შორის?
როგორ იმუშავებს წრედი თუ კვებების მერთების თანამიმდევრობას შევცვლით — ერთი კვების დადებით პოლუსს მივაერთებთ მეორე კვების დადებითს? ახსენით რატომ?',
                                                                       'ამ სავარჯიშოში პირველად უნდა გამოიყენონ მიმდევრობით ჩართული ორი კვების წყარო. ნათურის ნათების მომატებით პრაქტიკულად უნდა ნახონ, რომ ორი კვების წყაროს ძაბვა იკრიბება და ჯამური ძაბვა იზრდება.',
                                                                       'beginner'),

                                                                      ('ST.L1.3',
                                                                       'ნათურის ანთება ღილაკით და ჩამრთველით',
                                                                       'გამოიყენეთ მხოლოდ შემდეგი დეტალები: ღილაკი, ნათურა, ჩამრთველი, ერთი კვების წყარო და გამტარები. ააწყვეთ წრედი, რომელიც იმუშავებს ასე: წრედის აწყობის შემდეგ, თუ მხოლოდ ჩამრთველით ჩართავთ წრედს (ღილაკის გარეშე), ნათურა არ უნდა აინთოს; თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს. ამოცანაში დამატებით უნდა გამოიყენოთ ჩამრთველი — აწყობის პროცესში ის გამორთული უნდა იყოს; დარწმუნდების შემდეგ, რომ წრედი სწორად არის აწყობილი, შეგიძლიათ ჩართოთ.',
                                                                       'წრედში დენმა უნდა გაიაროს ჩამრთველის გავლით. ჩამრთველი ჩართეთ ღილაკამდე (საშუალო თავაური — კვების დადებითი პოლუსის მხრიდან).',
                                                                       'შეიცვლება თუ არა წრედის სამუშაო პრინციპი თუ ღილაკს და ჩამრთველს გავუცვლით ადგილები?
შეიცვლება თუ არა წრედის სამუშაო პრინციპი თუ ბუნებრივად შემოვატრიალებთ?',
                                                                       'ამ სავარჯიშიათი უნდა გაეცნონ ჩამრთველის პრაქტიკულ გამოყენებას. წრედის აწყობის დროს ჩამრთველი გამორთული უნდა იყოს; სასურველია მიერთოთ კვების დადებით პოლუსთან და ჩართოთ მხოლოდ აწყობის დასრულებისა და შემოწმების შემდეგ.',
                                                                       'beginner');

-- Insert required components for ST.L1.1
INSERT INTO problem_required_components (problem_id, component_name,quantity)
SELECT id, 'Power Supply', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Button', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Lamp 6V' ,1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 2', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 3', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 4', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 5', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 6', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Connector 7', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 20 Ω', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 100 Ω', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 1 kΩ', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 5.1 kΩ', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 10 kΩ', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 100 kΩ', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Resistor 510 kΩ', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'LED Red', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'LED Green', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'LED Blue', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Switch', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Motor', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Capacitor 1 µF', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Capacitor 10 µF', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Capacitor 100 µF', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Capacitor 470 µF', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Diode', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Relay', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Slide Switch', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Var. Resistor 10k', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'NPN Q1', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'PNP Q2', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'NPN Q3', 10 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'PNP Q4', 10 FROM problems WHERE code = 'ST.L1.1';

-- Insert required components for ST.L1.2
INSERT INTO problem_required_components (problem_id, component_name,quantity)
SELECT id, 'Power Supply', 2 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Button', 1 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Lamp 6V', 1 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 2', 10 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 3', 10 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 4', 10 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 5', 10 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 6', 10 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Connector 7', 10 FROM problems WHERE code = 'ST.L1.2';

-- Insert required components for ST.L1.3
INSERT INTO problem_required_components (problem_id, component_name,quantity)
SELECT id, 'Power Supply', 1 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Switch', 1 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Button', 1 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Lamp 6V', 1 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 2', 10 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 3', 10 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 4', 10 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 5', 10 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 6', 10 FROM problems WHERE code = 'ST.L1.3'
UNION ALL
SELECT id, 'Connector 7', 10 FROM problems WHERE code = 'ST.L1.3';

SELECT 'init.sql executed successfully - Problems initialized!' AS message;