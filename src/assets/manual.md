# Uživatelská příručka pro správu turnajů

V této příručce naleznete postup pro správu turnajů v aplikaci.

---

## 1. Správa uživatelů

V sekci **Admin > Správa uživatelů** můžete spravovat seznam hráčů a uživatelů aplikace.

- **Vytvoření uživatele:** Klikněte na zelené tlačítko *+ Přidat uživatele*. Povinné údaje jsou email, jméno. Další jsou nepovinné - HCP je ale potřeba pro Stableford turnaje. Nový hráč se pak v aplikaci musí zaregistrovat a nastavit si své heslo.
- **Úprava uživatele:** Klikněte na modré tlačítko *Upravit* u konkrétního uživatele.
- **Reset hesla:** Klikněte na žluté tlačítko *Reset hesla*. Uživateli přijde na email odkaz pro nastavení nového hesla.
- **Smazání uživatele:** Klikněte na červené tlačítko *Smazat*. Pozor, smazání je nevratné.

---

## 2. Správa hřišť

V sekci **Admin > Správa hřišť** můžete spravovat seznam hřišť a jejich parametrů. Tato data se používají pouze pro turnaje typu Stableford. Pro Ryder Cup se nepoužívají.

- **Vytvoření hřiště:** Klikněte na zelené tlačítko *+ Přidat hřiště*. Vyplňte název hřiště a další údaje - celkový par, pro jednotlivé jamky jejich par a handicap a pak pro jednotlivá odpaliště CR (course rating) a SR (slope rating).
- **Úprava hřiště:** Klikněte na modré tlačítko *Upravit* u konkrétního hřiště.
- **Smazání hřiště:** Klikněte na červené tlačítko *Smazat*. Pozor, smazání je nevratné.

---

## 3. Vytvoření nového turnaje

V sekci **Admin > Správa turnajů**:

1. Klikněte na tlačítko *+ Přidat turnaj*.
2. **Základní údaje:**
    - **ID turnaje:** Unikátní identifikátor (např. `2026-rydercup`).
    - **Název:** Název zobrazený v hlavičce (např. *Ryder Cup 2026*).
    - **Datum od/do:** Rozmezí trvání turnaje.
    - **Systém:** Zvolte *Ryder Cup* nebo *Stableford*.
    - **Stav:** Ponechte *Připravuje se*.

> Turnaj nelze přepnout na *Aktuální*, dokud nejsou nastaveni hráči, týmy a kola.

---

## 4. Nastavení složení turnaje (Hráči a Týmy)

V detailu turnaje (tlačítko *Spravovat*):

**Záložka "Hráči"**
- Vlevo vidíte dostupné uživatele. Kliknutím na uživatele jej přidáte do "Hráči v turnaji".
- Musíte vybrat všechny účastníky turnaje.

**Záložka "Týmy"**
- Pro Ryder Cup jsou automaticky vytvořeny týmy **Standard** a **Latin**.
- Pro Stableford je potřeba vytvořit týmy ručně. Klikněte na zelené tlačítko *+ Přidat tým* a vyplňte název týmu.
- Rozklikněte tým a pomocí výběrového pole *+ Přidat člena...* přiřaďte hráče do týmu.
- **Pravidla:**
    - Každý hráč musí být v právě jednom týmu.
    - Týmy musí mít stejný počet hráčů.

---

## 5. Nastavení kol - Ryder Cup

**Záložka "Kola - Ryder Cup"**
Kola se generují automaticky podle délky turnaje (Datum od - do).

- **Nastavení kola:** Pro každé kolo můžete upravit název a počet jamek (9/18/27).
- **Aktivace kola:** Přepínač *Aktivní* určuje, které kolo se aktuálně hraje a zobrazuje v aplikaci. Kola lze aktivovat pouze postupně. Nelze aktivovat např. 3. kolo, pokud předtím nebylo aktivní 2. kolo (nebo pokud není aktivní právě teď). Vždy může být aktivní maximálně jedno kolo. Aktivací nového kola se automaticky deaktivuje to předchozí.

**Zápasy v kole**
- V sekci kola klikněte na *+ Přidat zápas*.
- Vyberte hráče za Standard a za Latin.
- Pro čtyřhry můžete vybrat dva hráče za každý tým.
- Pokud je počet hráčů lichý, bude jeden zápas single, i když jde o kolo čtyřher.

---

## 6. Nastavení kol - Stableford

**Záložka "Kola - Stableford"**
Kola se generují automaticky podle délky turnaje (Datum od - do).

- **Nastavení kola:** Pro každé kolo je potřeba vybrat hřiště a pak zadat flighty. Pokud někteří hráči hrají z jiných odpališť, je potřeba nastavit pro každého hráče jeho odpaliště ve Správě uživatelů. 
- **Aktivace kola:** Přepínač *Aktivní* určuje, které kolo se aktuálně hraje a zobrazuje v aplikaci. Kola lze aktivovat pouze postupně. Nelze aktivovat např. 3. kolo, pokud předtím nebylo aktivní 2. kolo (nebo pokud není aktivní právě teď). Vždy může být aktivní maximálně jedno kolo. Aktivací nového kola se automaticky deaktivuje to předchozí.

**Flighty v kole**
- V sekci kola klikněte na *+ Přidat flight*.
- Vyberte hráče do flightu (1-4 hráči).

---

## 7. Aktivace a průběh turnaje

Jakmile máte vše nastaveno:

1. V záložce **Základní údaje** změňte Stav na **Aktuální**.
2. Pokud aplikace nahlásí chybu, zkontrolujte:
    - Zda jsou všichni hráči v týmech.
    - Zda je počet hráčů v týmech stejný.
    - Zda **není aktivní jiný turnaj** (systém povolí max. 1 aktivní turnaj).

Během hry:
- Na záložce *Kola* přepínejte aktivní kolo podle aktuálního dne.
- Skóre se zadává v sekci *Admin > Správa skóre* (nebo hráči sami, pokud mají oprávnění).

Po skončení turnaje změňte Stav na **Archiv**. Tím se automaticky deaktivují všechna kola.
