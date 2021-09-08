import { IMap, Game } from '../rtt_engine';
import { Drawer, Renderer, ScreenPositionToWorldPosition, Selection, UI } from '.';
import * as presenters from './presenters';

export class GameRenderer {
  renderer: Renderer;
  selection: Selection;
  ui?: UI;
  drawer: Drawer;

  constructor(map: IMap, game: Game, rttViewport: HTMLElement, rttSidebar: HTMLElement | null) {
    this.renderer = new Renderer(map.worldSize, window, document, rttViewport);
    this.renderer.animate(true);

    let screenPositionToWorldPosition = new ScreenPositionToWorldPosition(
      this.renderer.renderer.domElement,
      this.renderer.camera,
    );
    this.selection = new Selection(game, screenPositionToWorldPosition);
    if (rttSidebar != null) {
      this.ui = new UI(game, this.selection, rttSidebar, rttViewport);
    }

    this.drawer = new Drawer();

    let mapPresenter = new presenters.MapPresenter(map, this.renderer.gameCoordsGroup);
    mapPresenter.predraw();
    this.drawer.pre_drawables.push(mapPresenter);
    let obstructionPresenter = new presenters.ObstructionPresenter(game, this.renderer.gameCoordsGroup);
    obstructionPresenter.predraw();
    this.drawer.pre_drawables.push(obstructionPresenter);
    let powerSourcePresenter = new presenters.PowerSourcePresenter(game, this.renderer.gameCoordsGroup);
    powerSourcePresenter.predraw();
    this.drawer.pre_drawables.push(powerSourcePresenter);
    this.drawer.pre_drawables.push(new presenters.SelectionPresenter(this.selection, this.renderer.gameCoordsGroup));

    for (let i in game.players) {
      const player = game.players[i];
      if (player.units.commander != null) {
        this.drawer.main_drawables.push(new presenters.CommanderPresenter(player.units.commander, this.renderer.gameCoordsGroup));
      }
      this.drawer.main_drawables.push(new presenters.BotPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.ShotgunTankPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.ShotgunProjectilePresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.ArtilleryTankPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.ArtilleryProjectilePresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.TitanPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.TitanTurretPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.TitanProjectilePresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.EngineerPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.FactoryPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.HealthinessPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.PowerGeneratorPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.TurretPresenter(player, this.renderer.gameCoordsGroup));
      this.drawer.main_drawables.push(new presenters.TurretProjectilePresenter(player, this.renderer.gameCoordsGroup));
    }
  }

  update() {
    this.selection.update();
    this.drawer.draw();
    this.ui?.update();
  }
}
