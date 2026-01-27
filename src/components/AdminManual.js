import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const AdminManual = () => {
  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">Uživatelská příručka pro správu Ryder Cup turnajů</h2>

      <Accordion defaultActiveKey="0" alwaysOpen>
        {/* 1. Správa uživatelů */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>1. Správa uživatelů (User Management)</Accordion.Header>
          <Accordion.Body>
            <p>V sekci <strong>Admin &gt; Správa uživatelů</strong> můžete spravovat seznam hráčů a uživatelů aplikace.</p>
            <ul>
              <li><strong>Vytvoření uživatele:</strong> Klikněte na zelené tlačítko <em>+ Přidat uživatele</em>. Vyplňte email, jméno, ČGF číslo, HCP a další údaje.</li>
              <li><strong>Úprava uživatele:</strong> Klikněte na modré tlačítko <em>Upravit</em> u konkrétního uživatele.</li>
              <li><strong>Reset hesla:</strong> Klikněte na žluté tlačítko <em>Reset hesla</em>. Uživateli přijde na email odkaz pro nastavení nového hesla.</li>
              <li><strong>Smazání uživatele:</strong> Klikněte na červené tlačítko <em>Smazat</em>. Pozor, smazání je nevratné.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        {/* 2. Správa turnajů - Vytvoření */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>2. Vytvoření nového turnaje</Accordion.Header>
          <Accordion.Body>
            <p>V sekci <strong>Admin &gt; Správa turnajů</strong>:</p>
            <ol>
              <li>Klikněte na tlačítko <em>+ Přidat turnaj</em>.</li>
              <li><strong>Základní údaje:</strong>
                <ul>
                  <li><strong>ID turnaje:</strong> Unikátní identifikátor (např. <code>2025-rydercup</code>).</li>
                  <li><strong>Název:</strong> Název zobrazený v hlavičce (např. <em>Ryder Cup 2025</em>).</li>
                  <li><strong>Datum od/do:</strong> Rozmezí trvání turnaje.</li>
                  <li><strong>Systém:</strong> Zvolte <em>Ryder Cup</em>.</li>
                  <li><strong>Stav:</strong> Ponechte <em>Připravuje se</em>.</li>
                </ul>
              </li>
            </ol>
            <p className="text-muted">Poznámka: Turnaj nelze přepnout na <em>Aktuální</em>, dokud nejsou nastaveni hráči, týmy a kola.</p>
          </Accordion.Body>
        </Accordion.Item>

        {/* 3. Nastavení složení turnaje */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>3. Nastavení složení turnaje (Hráči a Týmy)</Accordion.Header>
          <Accordion.Body>
            <p>V detailu turnaje (tlačítko <em>Spravovat</em>):</p>
            <h5>Záložka "Hráči"</h5>
            <ul>
              <li>Vlevo vidíte dostupné uživatele. Kliknutím na uživatele jej přidáte do "Hráči v turnaji".</li>
              <li>Musíte vybrat všechny účastníky turnaje.</li>
            </ul>
            <h5>Záložka "Týmy"</h5>
            <ul>
              <li>Pro Ryder Cup jsou automaticky vytvořeny týmy <strong>Standard</strong> a <strong>Latin</strong>.</li>
              <li>Rozklikněte tým a pomocí výběrového pole <em>+ Přidat člena...</em> přiřaďte hráče do týmu.</li>
              <li><strong>Pravidla:</strong>
                <ul>
                  <li>Každý hráč musí být v právě jednom týmu.</li>
                  <li>Týmy musí mít stejný počet hráčů.</li>
                </ul>
              </li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        {/* 4. Nastavení kol */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>4. Nastavení kol</Accordion.Header>
          <Accordion.Body>
            <h5>Záložka "Kola"</h5>
            <p>Kola se generují automaticky podle délky turnaje (Datum od - do).</p>
            <ul>
              <li><strong>Nastavení kola:</strong> Pro každé kolo můžete upravit název a počet jamek (9/18/27).</li>
              <li><strong>Aktivace kola:</strong> Přepínač <em>Aktivní</em> určuje, které kolo se aktuálně hraje a zobrazuje v aplikaci.</li>
            </ul>
            <div className="alert alert-warning">
              <strong>Důležité pravidlo:</strong> Kola lze aktivovat pouze postupně.
              Nelze aktivovat např. 3. kolo, pokud předtím nebylo aktivní 2. kolo (nebo pokud není aktivní právě teď).
              Vždy může být aktivní maximálně jedno kolo. Aktivací nového kola se automaticky deaktivuje to předchozí.
            </div>
            <h5>Zápasy v kole</h5>
            <ul>
              <li>V sekci kola klikněte na <em>+ Přidat zápas</em>.</li>
              <li>Vyberte hráče za Standard a za Latin.</li>
              <li>Pro čtyřhry můžete vybrat dva hráče za každý tým.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        {/* 5. Aktivace turnaje */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>5. Aktivace a průběh turnaje</Accordion.Header>
          <Accordion.Body>
            <p>Jakmile máte vše nastaveno:</p>
            <ol>
              <li>V záložce <strong>Základní údaje</strong> změňte Stav na <strong>Aktuální</strong>.</li>
              <li>Pokud aplikace nahlásí chybu, zkontrolujte:
                <ul>
                  <li>Zda jsou všichni hráči v týmech.</li>
                  <li>Zda je počet hráčů v týmech stejný.</li>
                  <li>Zda <strong>není aktivní jiný turnaj</strong> (systém povolí max. 1 aktivní turnaj).</li>
                </ul>
              </li>
            </ol>
            <p>Během hry:</p>
            <ul>
              <li>Na záložce <em>Kola</em> přepínejte aktivní kolo podle aktuálního dne.</li>
              <li>Skóre se zadává v sekci <em>Admin &gt; Správa skóre</em> (nebo hráči sami, pokud mají oprávnění).</li>
            </ul>
            <p>Po skončení turnaje změňte Stav na <strong>Archiv</strong>. Tím se automaticky deaktivují všechna kola.</p>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default AdminManual;
