import {Game} from '../../../src/server/Game';
import {MoonData} from '../../../src/server/moon/MoonData';
import {MoonExpansion} from '../../../src/server/moon/MoonExpansion';
import {cast, testRedsCosts} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {MoonMineStandardProject} from '../../../src/server/cards/moon/MoonMineStandardProject';
import {expect} from 'chai';
import {SelectPaymentDeferred} from '../../../src/server/deferredActions/SelectPaymentDeferred';
import {PlaceMoonMineTile} from '../../../src/server/moon/PlaceMoonMineTile';
import {MooncrateBlockFactory} from '../../../src/server/cards/moon/MooncrateBlockFactory';
import {Phase} from '../../../src/common/Phase';
import {Payment} from '../../../src/common/inputs/Payment';

describe('MoonMineStandardProject', () => {
  let game: Game;
  let player: TestPlayer;
  let moonData: MoonData;
  let card: MoonMineStandardProject;

  beforeEach(() => {
    player = TestPlayer.BLUE.newPlayer();
    game = Game.newInstance('gameid', [player], player, {moonExpansion: true});
    moonData = MoonExpansion.moonData(game);
    card = new MoonMineStandardProject();
  });

  it('can act', () => {
    player.titanium = 1;
    player.megaCredits = 19;
    expect(player.canPlay(card)).is.false;

    player.titanium = 0;
    player.megaCredits = 20;
    expect(player.canPlay(card)).is.false;

    player.titanium = 1;
    player.megaCredits = 20;
    expect(player.canPlay(card)).is.true;

    // 2. Are there spaces on the moon for a Mine?
  });

  it('has discount', () => {
    card.action(player);
    let payAction = cast(game.deferredActions.pop(), SelectPaymentDeferred);
    expect(payAction.amount).eq(20);

    player.playedCards.push(new MooncrateBlockFactory());
    card.action(player);
    payAction = cast(game.deferredActions.pop(), SelectPaymentDeferred);
    expect(payAction.amount).eq(16);
  });

  it('act', () => {
    player.titanium = 3;
    expect(player.getTerraformRating()).eq(14);
    expect(player.production.steel).eq(0);

    card.action(player);
    const payAction = cast(game.deferredActions.pop(), SelectPaymentDeferred);
    payAction.cb(Payment.EMPTY);

    expect(player.titanium).eq(2);
    expect(player.production.steel).eq(1);
    expect(moonData.miningRate).eq(0);

    const placeTileAction = cast(game.deferredActions.peek(), PlaceMoonMineTile);
    placeTileAction.execute()!.cb(moonData.moon.spaces[2]);

    expect(moonData.miningRate).eq(1);
    expect(player.getTerraformRating()).eq(15);
  });

  it('can act when Reds are in power.', () => {
    const player = TestPlayer.BLUE.newPlayer();
    const game = Game.newInstance('gameid', [player], player, {moonExpansion: true, turmoilExtension: true});
    const moonData = MoonExpansion.moonData(game);
    game.phase = Phase.ACTION;

    // Card requirements
    player.titanium = 1;

    testRedsCosts(() => card.canAct(player), player, card.cost, 3);
    moonData.miningRate = 8;
    testRedsCosts(() => card.canAct(player), player, card.cost, 0);
  });
});

