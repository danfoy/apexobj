const { expect } = require('chai');
const MockDate = require('mockdate');
const Playlist = require('../classes/Playlist');
const PlaylistItem = require('../classes/PlaylistItem');
const ScheduledPlaylistItem = require('../classes/ScheduledPlaylistItem');
const seasonData = require('../data/seasons.json').seasons[0];


describe('@ScheduledPlaylistItem', function() {
    it('returns a superset of PlaylistItem', function() {
        const testStartTime = new Date();
        const testPlaylistItem = new PlaylistItem({mapName: 'we', mapDuration: 60, startTime: testStartTime});
        expect(new ScheduledPlaylistItem({mapName: 'we', mapDuration: 60, startTime: new Date()}))
            .to.include(testPlaylistItem);
    });

    it('throws if startTime is invalid', function() {
        expect(()=> new ScheduledPlaylistItem({mapName: 'we', mapDuration: 60, startTime: 'zzz'}))
            .to.throw();

        expect(()=> new ScheduledPlaylistItem({mapName: 'we', mapDuration: 60, startTime: new Date()}))
            .to.not.throw();
    });


    describe('.timeRemaining getter', function() {
        it('returns known correct values from season 11', function() {

            function check(date, mapDuration) {
                MockDate.set(date);
                const playlist = new Playlist(seasonData.playlists[0], seasonData);
                const timeRemaining = Math.floor(playlist.currentMap.timeRemaining);
                expect(timeRemaining).to.equal(mapDuration - 1)
                MockDate.reset();
            };

            check('2022-01-11T12:00:00Z', 60  )
            check('2022-01-11T13:00:00Z', 120 )
            check('2022-01-11T15:00:00Z', 120 )
            check('2022-01-11T17:00:00Z', 90  )
            check('2022-01-11T18:30:00Z', 90  )
            check('2022-01-11T20:00:00Z', 120 )
            check('2022-01-11T22:00:00Z', 120 )
            check('2022-01-12T00:00:00Z', 90  )
            check('2022-01-12T01:30:00Z', 90  )
            check('2022-01-12T03:00:00Z', 60  )
            check('2022-01-12T04:00:00Z', 60  )
        });

        // it('does not return negative values', function() {
        //     // Regression test for known example where .timeRemaining was negative
        //     function check(date) {
        //         MockDate.set(date);
        //         const testMap = new Playlist(seasonData.playlists[0], seasonData).currentMap;
        //         console.log(`Map for spoofed ${new Date()}:`,testMap);
        //         expect(testMap.timeRemaining).to.be.gt(0);
        //         MockDate.reset();
        //     }

        //     check('2022-01-17T04:10:00Z');
        // });
    });

});
