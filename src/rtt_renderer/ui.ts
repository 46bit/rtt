import { Game, Player } from '../rtt_engine';
import { Order } from '../rtt_engine/entities/abilities';
import { Selection, Button } from './';

type ScoreTableRow = {"nameCell": any, "energyCell": any, "incomeCell": any, "unitsCell": any};

export class UI {
  game: Game;
  selection: Selection;
  sidebar: any;
  viewport: any;
  timeCell: HTMLElement;
  scoreTableRows: {[playerName: string]: ScoreTableRow};
  playerTabs: {[name: string]: any};
  selectedUnitList: any;
  selectedUnits: {[name: string]: any};
  orderInProgress: Order["kind"] | null;

  constructor(game: Game, selection: Selection, sidebar: any, viewport: any) {
    this.game = game;
    this.selection = selection;
    this.sidebar = sidebar;
    this.viewport = viewport;

    this.scoreTableRows = {};
    const scoreTable = document.getElementsByClassName("player-scores")[0];
    this.timeCell = scoreTable.getElementsByClassName("time")[0] as HTMLElement;
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
      playerTab.addEventListener("mousedown", (e: MouseEvent) => this.playerTabMouseDown(e));

      const bottomLine = document.createElement("div");
      bottomLine.className = "bottom-line";
      playerTab.appendChild(bottomLine);

      playersTabs.appendChild(playerTab);
      this.playerTabs[player.name] = playerTab;
    });

    this.selectedUnitList = document.getElementsByClassName("player--selected-units")[0];
    this.selectedUnits = new Map();
    this.orderInProgress = null;
    this.viewport.addEventListener("mousedown", (e: MouseEvent) => this.viewportMouseDown(e));
  }

  update() {
    const timeElapsedInSeconds = this.game.updateCounter / 30;
    let minutesElapsed = Math.floor(timeElapsedInSeconds / 60);
    let secondsElapsed = Math.floor(timeElapsedInSeconds % 60);
    if (secondsElapsed == 60) {
      minutesElapsed++;
      secondsElapsed = 0;
    }
    const zeroPad = (n: number) => n >= 10 ? `${n}` : `0${n}`;
    this.timeCell.innerText = `${zeroPad(minutesElapsed)}:${zeroPad(secondsElapsed)}`;

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
      (document.getElementsByClassName("player--selected-units-heading")[0] as HTMLElement).style.display = "block";
    } else {
      (document.getElementsByClassName("player--selected-units-heading")[0] as HTMLElement).style.display = "none";
    }
    selectionEntityCounts.forEach((entityCount, entityName) => {
      let element;
      if (!this.selectedUnits.has(entityName)) {
        element = document.createElement("li");
        element.dataset.entityName = entityName;
        element.style.cursor = "pointer";
        element.title = entityName;
        element.addEventListener("mousedown", (e: MouseEvent) => this.selectedUnitMouseDown(e), false);

        const count = document.createElement("span");
        count.className = "count";
        element.appendChild(count);

        const name = document.createElement("span");
        name.className = "name";
        name.innerText = entityName;
        element.appendChild(name);

        this.selectedUnitList.appendChild(element);
        this.selectedUnits.set(entityName, element);
      } else {
        element = this.selectedUnits.get(entityName);
      }
      // FIXME: Start updating styling when the player changes, not every single UI update
      if (this.selection.selectedPlayer) {
        element.style.setProperty("--player-color", this.selection.selectedPlayer.color.getStyle());
      }
      element.getElementsByClassName("count")[0].innerText = entityCount.toString();
    });
    this.selectedUnits.forEach((element: HTMLElement, entityName: string) => {
      if (!selectionEntityCounts.has(entityName)) {
        this.selectedUnitList.removeChild(element);
        this.selectedUnits.delete(entityName);
      }
    });

    const issuableOrders = this.selection.issuableOrders();
    let panelEmpty = true;
    const orderPanel = document.getElementsByClassName("player--order-panel")[0];
    // FIXME: Start updating rather than recreating each update
    orderPanel.innerHTML = "";
    issuableOrders.forEach((entitiesThatCanTakeOrder, orderKind) => {
      // FIXME: Enable more kinds of orders
      if (orderKind != "manoeuvre") {
        return;
      }
      panelEmpty = false;
      const element = document.createElement("li");
      const button = document.createElement("button");
      button.innerText = orderKind;
      button.dataset.orderKind = orderKind;
      button.addEventListener("mousedown", (e) => this.orderMouseDown(e));
      element.appendChild(button);
      orderPanel.appendChild(element);
    });
    (document.getElementsByClassName("player--order-panel-heading")[0] as HTMLElement).style.display = panelEmpty ? "none" : "block";
  }

  playerTabMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const playerName = (event.currentTarget! as HTMLElement).dataset.playerName;
    if (this.selection.selectedPlayer && this.selection.selectedPlayer.name == playerName) {
      this.selection.selectedPlayer = null;
    } else {
      this.selection.selectedPlayer = this.game.players.filter((p) => p.name == playerName)[0];
    }
  }

  selectedUnitMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const clickedEntityName = (event.currentTarget! as HTMLElement).dataset.entityName;
    this.selection.selectedEntities = this.selection.selectedEntities.filter((entity) => {
      const entityName = entity.constructor.name;
      return event.button == Button.RightClick ? entityName != clickedEntityName : entityName == clickedEntityName;
    });
  }

  orderMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const orderKind = (event.currentTarget! as HTMLElement).dataset.orderKind as Order["kind"];
    this.orderInProgress = orderKind;
  }

  // FIXME: Ordering needs to be done better than this. Somehow.
  viewportMouseDown(event: MouseEvent) {
    if (event.button != Button.RightClick) {
      return;
    }

    const orderKind = this.orderInProgress ? this.orderInProgress : "manoeuvre";
    const issuableOrders = this.selection.issuableOrders();
    if (!issuableOrders.has(orderKind)) {
      return;
    }

    // FIXME: Support other types of orders
    if (orderKind != "manoeuvre") {
      return;
    }

    let worldPosition = this.selection.screenPositionToWorldPosition.convert(event.clientX, event.clientY)!;
    issuableOrders.get(orderKind)!.forEach((entity, _) => {
      entity.orders[0] = {
        kind: orderKind,
        destination: worldPosition,
      };
    });
  }
}
