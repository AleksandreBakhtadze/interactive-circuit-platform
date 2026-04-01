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
                                                                       'გამოიყენეთ მხოლოდ შემდეგი დეტალები : ღილაკი, ნათურა, ორი კვების წყარო და გამტარები. ააწყვეთ წრედი , რომელიც იმუშავებს ასე : თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს.',
                                                                       'ერთი კვების წყაროს დადებითი პოლუსი მიაერთეთ მეორე კვების წყაროს უარყოფით პოლუსს.',
                                                                       'როგორ იმუშავებს წრედი თუ ნათურას ჩავრთავთ კვების წყაროებს შორის?
როგორ იმუშავებს წრედი თუ კვებების მერთების თანამიმდევრობას შევცვლით, ერთი კვებებს დადებით პოლუსს მივაერთებთ მეორე
კვების დადებითს. ახსენით რატომ?',
                                                                       'ამ სავარჯიშოში პირველად უნდა გამოიყენონ მიმდევრობით ჩართული ორი კვების წყარო. ნათურის ნათების მომატებით პრაქტიკულად
უნდა ნახონ რომ ორი კვების წყაროს ძაბვა იკრიბება და ჯამური ძაბვა იზრდება.',
                                                                       'beginner');

-- Insert required components for ST.L1.1
INSERT INTO problem_required_components (problem_id, component_name,quantity)
SELECT id, 'Power Supply', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Button', 1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Lamp 6V' ,1 FROM problems WHERE code = 'ST.L1.1'
UNION ALL
SELECT id, 'Wire', 200 FROM problems WHERE code = 'ST.L1.1';

-- Insert required components for ST.L1.2
INSERT INTO problem_required_components (problem_id, component_name,quantity)
SELECT id, 'Power Supply',2 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Button', 1 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Lamp 6V' , 1 FROM problems WHERE code = 'ST.L1.2'
UNION ALL
SELECT id, 'Wire',200 FROM problems WHERE code = 'ST.L1.2';

SELECT 'init.sql executed successfully - Problems initialized!' AS message;