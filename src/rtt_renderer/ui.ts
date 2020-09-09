import { Game, Player } from '../rtt_engine';
import { Selection, Button } from './';

type ScoreTableRow = {"nameCell": any, "energyCell": any, "incomeCell": any, "unitsCell": any};

export class UI {
  game: Game;
  selection: Selection;
  sidebar: any;
  scoreTableRows: {[playerName: string]: ScoreTableRow};
  playerTabs: {[name: string]: any};
  selectedUnitList: any;
  selectedUnits: {[name: string]: any};

  constructor(game: Game, selection: Selection, sidebar: any) {
    this.game = game;
    this.selection = selection;
    this.sidebar = sidebar;

    this.scoreTableRows = {};
    const scoreTable = document.getElementsByClassName("player-scores")[0];
    const scoreTableBody = scoreTable.getElementsByTagName("tbody")[0];
    this.game.players.forEach((player) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("th");
      nameCell.innerText = player.name;
      nameCell.style.color = player.color.getStyle();
      row.appendChild(nameCell);
      const energyCell = document.createElement("td");
      energyCell.innerText = Math.round(player.storedEnergy).toString();
      row.appendChild(energyCell);
      const incomeCell = document.createElement("td");
      incomeCell.innerText = "+" + Math.round(player.units.energyOutput()).toString();
      row.appendChild(incomeCell);
      const unitsCell = document.createElement("td");
      unitsCell.innerText = player.units.unitCount().toString();
      row.appendChild(unitsCell);
      const aiCell = document.createElement("td");
      aiCell.innerText = player.aiName || "none";
      row.appendChild(aiCell);
      scoreTableBody.appendChild(row);
      this.scoreTableRows[player.name] = {
        nameCell: nameCell,
        energyCell: energyCell,
        incomeCell: incomeCell,
        unitsCell: unitsCell,
      };
    });

    const playersTabs = document.getElementsByClassName("players--tabs")[0];
    playersTabs.innerHTML = "";
    this.playerTabs = {};
    this.game.players.forEach((player) => {
      const playerTab = document.createElement("li");
      playerTab.dataset.playerName = player.name;
      playerTab.style.setProperty("--player-color", player.color.getStyle());
      playerTab.innerText = player.name;
      if (this.selection.selectedPlayer && player == this.selection.selectedPlayer) {
        playerTab.className = "active";
      }
      playerTab.addEventListener("mousedown", (e) => this.playerTabMouseDown(e));

      const bottomLine = document.createElement("div");
      bottomLine.className = "bottom-line";
      playerTab.appendChild(bottomLine);

      playersTabs.appendChild(playerTab);
      this.playerTabs[player.name] = playerTab;
    });

    this.selectedUnitList = document.getElementsByClassName("player--selected-units")[0];
    this.selectedUnits = new Map();
  }

  update() {
    this.game.players.forEach((player) => {
      if (player.isDefeated()) {
        this.scoreTableRows[player.name].nameCell.style.color = "grey";
        this.scoreTableRows[player.name].nameCell.parentElement.style.color = "grey";
        this.scoreTableRows[player.name].nameCell.style.textDecoration = "line-through double";
        this.scoreTableRows[player.name].energyCell.innerText = "-";
        this.scoreTableRows[player.name].incomeCell.innerText = "-";
        this.scoreTableRows[player.name].unitsCell.innerText = "-";

        this.playerTabs[player.name].style.color = "grey";
      } else {
        this.scoreTableRows[player.name].energyCell.innerText = Math.round(player.storedEnergy).toString();
        this.scoreTableRows[player.name].incomeCell.innerText = "+" + Math.round(player.units.energyOutput()).toString();
        this.scoreTableRows[player.name].unitsCell.innerText = player.units.unitCount().toString();
      }

      this.playerTabs[player.name].className = player == this.selection.selectedPlayer ? "active": "";
    });

    const selectionEntityCounts = new Map();
    this.selection.selectedEntities.forEach((entity) => {
      const entityName = entity.constructor.name;
      if (!selectionEntityCounts.has(entityName)) {
        selectionEntityCounts.set(entityName, 0);
      }
      selectionEntityCounts.set(entityName, selectionEntityCounts.get(entityName) + 1);
    });
    if (selectionEntityCounts.size > 0) {
      document.getElementsByClassName("player--selected-units-heading")[0].style.display = "block";
    } else {
      document.getElementsByClassName("player--selected-units-heading")[0].style.display = "none";
    }
    selectionEntityCounts.forEach((entityCount, entityName) => {
      if (!this.selectedUnits.has(entityName)) {
        const element = document.createElement("li");
        element.dataset.entityName = entityName;
        element.style.cursor = "pointer";
        element.title = entityName;
        element.addEventListener("mousedown", (e) => this.selectedUnitMouseDown(e), false);

        const count = document.createElement("span");
        count.className = "count";
        element.appendChild(count);

        const name = document.createElement("span");
        name.className = "name";
        name.innerText = entityName;
        element.appendChild(name);

        this.selectedUnitList.appendChild(element);
        this.selectedUnits.set(entityName, element);
      }
      this.selectedUnits.get(entityName).getElementsByClassName("count")[0].innerText = entityCount.toString();
    });
    this.selectedUnits.forEach((element, entityName) => {
      if (!selectionEntityCounts.has(entityName)) {
        this.selectedUnitList.removeChild(element);
        this.selectedUnits.delete(entityName);
      }
    });
  }

  playerTabMouseDown(event: {currentTarget: any}) {
    const playerName = event.currentTarget.dataset.playerName;
    if (this.selection.selectedPlayer && this.selection.selectedPlayer.name == playerName) {
      this.selection.selectedPlayer = null;
    } else {
      this.selection.selectedPlayer = this.game.players.filter((p) => p.name == playerName)[0];
    }
  }

  selectedUnitMouseDown(event: {currentTarget: any}) {
    event.preventDefault();
    event.stopPropagation();
    const clickedEntityName = event.currentTarget.dataset.entityName;
    this.selection.selectedEntities = this.selection.selectedEntities.filter((entity) => {
      const entityName = entity.constructor.name;
      return event.button == Button.RightClick ? entityName != clickedEntityName : entityName == clickedEntityName;
    });
  }
}
