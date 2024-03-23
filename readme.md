# Hlídač výstrah

- English version of this file is in the project folder under the name readme.en.md

## Úvod

- Hlídač výstrah je webová aplikace zobrazující výstrahy před meteorologickými jevy v krajích a obcích s rozšířenou působností v České republice.
- Aplikace umožňuje uživatelům vytvořit si účet a nastavit odesílání upozornění na email pro vybrané jevy v jejich zvolené lokalitě.

### Backend
  - C# .NET 6 Core Web API
  - MSSQL (Microsoft SQL Server)

### Frontend
  - React.js
  - Bootstrap
  - Sass

## Obsah

1. [Úvod](#úvod)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Instalace](#instalace)
5. [Konfigurace](#konfigurace)
6. [API Dokumentace](#api-dokumentace)
7. [Migrace databáze](#migrace-databáze)
8. [Nasazení](#nasazení)
9. [Zásluhy](#zásluhy)

## Instalace

- **Klonování repozitáře**:
   ```bash
   git clone https://github.com/DanielPaviza/hlidacVystrah.git
   cd hlidacVystrah

- **Závislosti**
    - Technologie
      - [Node.js](https://nodejs.org/en/)
      - [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
    - Frontend
        - axios 1.6.5
        - react-bootstrap 2.9.2
        - react-helmet 6.1.0
        - sass 1.69.5
    - Backend
        - MailKit 4.3.0
        - Microsoft.AspNetCore.SpaProxy 6.0.11
        - Microsoft.EntityFrameworkCore 7.0.12
        - Microsoft.EntityFrameworkCore.SqlServer 7.0.12
        - Microsoft.EntityFrameworkCore.Tools 7.0.12
        - Swashbuckle.AspNetCore 4.5.0

- **Instalace závislostí**

  - Stažení a instalace [Node.js](https://nodejs.org/en/)
  - Stažení a instalace [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)

  - **Backend**
    ```bash
    cd /hlidacVystrah/hlidacVystrah
    dotnet restore
    
  - **Frontend**
    ```bash
    cd /hlidacVystrah/hlidacVystrah/ClientApp
    npm install

## Konfigurace
- V souborech `appsettings.json` a `appsettings.Development.json` je třeba nastavit connection string pro připojení k databázi a údaje k připojení k smtp serveru.

## API Dokumentace
### Frontend
- **/**
  - Úvodní stránka aplikace s pohledem na meteorologickou situaci v celé České republice.

- **/obec/:cisorp**
  - Stránka s detailními informacemi o obci s rozšířenou působností na základě jejího čísla.
  - Např. `/obec/1100` zobrazí detail obce Praha, `/obec/3209` zobrazí detail obce Plzeň.

- **/history**
  - Stránka umožňující procházet všechny dostupné historické záznamy o meteorologické situaci.

- **/register**
  - Stránka pro registraci nového uživatelského účtu.

- **/resetpassword**
  - Stránka pro odeslání e-mailové zprávy s odkazem na změnu hesla na danou adresu.

- **/newpassword**
  - Stránka pro změnu zapomenutého hesla.

- **/activateaccount**
  - Stránka pro aktivaci nově vytvořeného účtu.

- **/login**
  - Stránka pro přihlášení do správy účtu.

- **/account**
  - Stránka pro správu uživatelského účtu s možností úpravy sledovaných jevů a správou účtu.

- **/_adm**
  - Stránka administrace aplikace.

- **/_adm/logs**
  - Stránka administrace s logy aplikace.

- **/_adm/users**
  - Stránka administrace s uživateli aplikace.

### Backend
- Pro API dokumentaci lze použít nástroj Swagger. Po spuštění projektu lze přistoupit k dokumentaci API přes URL `/swagger`.
  - Swagger UI poskytuje interaktivní rozhraní pro prohlížení a testování API endpointů.
  - Uživatelé mohou snadno procházet dostupné endpointy, zobrazovat jejich parametry a odesílat žádosti přímo z rozhraní.

## Migrace databáze
- V projektu je složka `Migrations` obsahující migrace databáze. Uživatelé pouze potřebují spustit aktualizaci databáze pomocí Entity Framework Core migrace.

1. Otevřete příkazový řádek nebo terminál v adresáři s projektem.
2. Spusťte následující příkaz pro aplikaci migrací a vytvoření databázového schématu:
   ```bash
   dotnet ef database update

## Nasazení
### Pomocí Visual Studio 2022

1. Otevřete projekt ve Visual Studiu.
2. Klikněte pravým tlačítkem na projekt a vyberte možnost "Publish".
3. Postupujte podle průvodce publikováním a vyberte cílové místo, kam se má aplikace nasadit.

### Přes příkazovou řádku

1. Otevřete příkazový řádek nebo terminál v adresáři s projektem.
2. Pro sestavení a nasazení backendové části aplikace použijte příkaz:
   ```bash
   dotnet publish -c Release
3. Výsledný balíček bude umístěn ve složce `bin/Release/net6.0/publish`.

- Do složky s publikovanou aplikací vložte složku `MailTemplates`.

## Zásluhy
- **[ČHMÚ](https://www.chmi.cz/) (Český hydrometeorologický ústav):** Poskytnutí [meteorologických dat](https://www.chmi.cz/files/portal/docs/meteo/om/bulletiny/XOCZ50_OKPR.xml).
