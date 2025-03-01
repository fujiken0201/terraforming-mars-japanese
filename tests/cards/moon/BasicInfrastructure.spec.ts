import {Game} from '../../../src/server/Game';
import {MoonData} from '../../../src/server/moon/MoonData';
import {MoonExpansion} from '../../../src/server/moon/MoonExpansion';
import {cast} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {BasicInfrastructure} from '../../../src/server/cards/moon/BasicInfrastructure';
import {expect} from 'chai';
import {PlaceMoonRoadTile} from '../../../src/server/moon/PlaceMoonRoadTile';

describe('BasicInfrastructure', () => {
  let game: Game;
  let player: TestPlayer;
  let moonData: MoonData;
  let card: BasicInfrastructure;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    game = Game.newInstance('gameid', [player], player, {moonExpansion: true});
    moonData = MoonExpansion.moonData(game);
    card = new BasicInfrastructure();
  });

  it('play', () => {
    expect(player.production.megacredits).eq(0);
    expect(player.getTerraformRating()).eq(14);
    expect(moonData.logisticRate).eq(0);
    expect(player.colonies.getFleetSize()).eq(1);

    card.play(player);
    const placeTileAction = cast(game.deferredActions.peek(), PlaceMoonRoadTile);
    placeTileAction.execute()!.cb(moonData.moon.spaces[2]);

    expect(moonData.logisticRate).eq(1);
    expect(player.getTerraformRating()).eq(15);
    expect(player.colonies.getFleetSize()).eq(2);
  });
});

