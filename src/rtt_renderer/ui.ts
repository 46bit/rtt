import { Game, Player } from '../rtt_engine';
import { Selection, Button } from './';

export class UI {
  game: Game;
  selection: Selection;
  sidebar: any;
  playerTabs: {[name: string]: any};
  energyIncomes: {[name: string]: any};
  selectedPlayer: Player;
  selectedUnitList: any;
  selectedUnits: {[name: string]: any};

  constructor(game: Game, selection: Selection, sidebar: any) {
    this.game = game;
    this.selection = selection;
    this.sidebar = sidebar;

    const playersTabs = document.getElementsByClassName("players--tabs")[0];
    playersTabs.innerHTML = "";
    this.playerTabs = {};
    this.energyIncomes = {};
    this.selectedPlayer = this.game.players[0];
    this.game.players.forEach((player) => {
      const playerTab = document.createElement("li");
      playerTab.style.setProperty("--player-color", player.color.getStyle());
      playerTab.innerText = player.name;
      if (player == this.selectedPlayer) {
        playerTab.className = "active";
      }
      const energyIncome = document.createElement("span");
      energyIncome.className = "energy-income";
      this.energyIncomes[player.name] = energyIncome;
      playerTab.appendChild(energyIncome);
      const bottomLine = document.createElement("div");
      bottomLine.className = "bottom-line";
      playerTab.appendChild(bottomLine);
      this.playerTabs[player.name] = playerTab;
      playersTabs.appendChild(playerTab);
    });

    this.selectedUnitList = document.getElementsByClassName("player--selected-units")[0];
    this.selectedUnits = new Map();
  }

  update() {
    this.game.players.forEach((player) => {
      if (player.isDefeated()) {
        this.playerTabs[player.name].style.color = "grey";
        this.energyIncomes[player.name].style.display = "none";
      } else {
        this.energyIncomes[player.name].innerText = "+" + player.units.energyOutput().toString();
      }
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
