import { expect } from 'chai';
import { set, reset } from 'mockdate';
import { parseDate } from '../src/util/index.js';
import apex from '../src/index.js';

describe('@SplitPlaylist', function() {

    const season11 = apex.seasons.find(season => season.id === 11);
    const season11RankedBR = season11.playlists.find(playlist => playlist.mode === 'Ranked Leagues');

    describe('.splitTime property', function() {
        it('returns a date', function() {
            expect(parseDate(season11RankedBR.splitTime)).to.be.ok.and.not.eql(new Date());
        });
    });

    describe('.rotations property', function() {
        it('returns an Array', function () {
            expect(season11RankedBR.rotations).to.be.an('array');
        });

        it('returns correct results for Season 11', function() {
            expect(season11RankedBR.rotations[0].map).to.equal('Storm Point');
            expect(season11RankedBR.rotations[1].map).to.equal("World's Edge");
        });
    });

    describe('.currentMap pseudo property', function() {

        it('returns null if outside current playlist date boundary', function() {
            function check(date) {
                set(date);
                expect(season11RankedBR.currentMap).to.be.null;
                reset();
            };

            check('2021-11-01T00:00:00Z');
            check('2022-02-10T00:00:00Z');
        });

        it('provides correct values for Season 11', function() {
            function check(date, map) {
                set(date);
                expect(season11RankedBR.currentMap.map).to.equal(map);
                reset();
            };

            check('2021-11-05T00:00:00Z', 'Storm Point');
            check('2021-12-24T00:00:00Z', "World's Edge");
        });
    });

    describe('.nextMap pseudo property', function() {
        it('returns null if after season end', function() {
            set('2022-02-10T00:00:00Z');
            expect(season11RankedBR.nextMap).to.be.null;
            reset();
        });

        it('returns the first rotation if before season start', function() {
            set('2021-11-01T00:00:00Z');
            expect(season11RankedBR.nextMap.map).to.equal('Storm Point');
            reset();
        });

        it('returns the next split if there is one', function() {
            set('2021-12-20T00:00:00Z');
            expect(season11RankedBR.nextMap.map).to.equal("World's Edge");
            reset();

            // During second split
            set('2021-12-24T00:00:00Z');
            expect(season11RankedBR.nextMap).to.be.null;
            reset();
        });
    });

    describe('.getMapByDate(date) method', function() {

        it('throws if an invalid date is provided', function() {
            expect(()=>season11RankedBR.getMapByDate('zzz')).to.throw();
        });

        it('returns null if outside season date boundary', function() {
            function check(date) {
                expect(season11RankedBR.getMapByDate(date)).to.be.null;
            };

            check('2021-11-01T00:00:00Z');
            check('2022-02-10T00:00:00Z');
        });

        it('uses the current date if none provided', function() {
            set('2021-11-05T00:00:00Z');
            expect(season11RankedBR.getMapByDate().map).to.equal('Storm Point');
            reset();
        });

        it('returns correct values for Season 11', function() {
            function check(date, map) {
                expect(season11RankedBR.getMapByDate(date).map)
                    .to.equal(map);
            };

            check('2021-11-05T00:00:00Z', 'Storm Point');
            check('2021-12-24T00:00:00Z', "World's Edge");
        });
    });

});
