const { isParseableDate, parseDate } = require('../util');
const Playlist = require('./Playlist');
const PlaylistItem = require('./PlaylistItem');
const ScheduledPlaylistItem = require('./ScheduledPlaylistItem');

class RotatingPlaylist extends Playlist {
    constructor(playlistData, seasonData) {
        super(playlistData, seasonData);

        // Argument validation
        if(!playlistData.maps || !playlistData.mapDurations)
            throw new Error('Requires .maps and .mapDurations from Season');

        // Private properties
        const { maps, mapDurations } = playlistData;

        // Public properties
        this.rotations = [...mapDurations.map(duration => duration * 60 * 1000)]
            .map(duration => [...maps]
                .map(map => new PlaylistItem({mapName: map, mapDuration: duration}, this))
            ).flat();
    };

    get rotationBaseTime() {
        const baseDate = new Date(this.startTime);
        baseDate.setUTCHours(12);
        return baseDate;
    };

    get playlistRotationsDuration() {
        return this.rotations.reduce( (accumulator, currentItem) => {
            return accumulator + currentItem.duration;
        }, 0);
    };

    get currentIndex() {
        return this.getIndexByOffset(this.getPlaylistTimeElapsed());
    };

    get currentMap() {
        return this.getMapByDate();
    };

    get nextMap() {
        if (new Date() < this.startTime) return this.getMapByDate(this.startTime);
        if (new Date() >= this.endTime) return null;
        if (this.currentMap.endTime >= this.endTime) return null;
        return this.getMapByDate(this.currentMap.endTime);
    };

    getIndexByOffset(offset) {
        const offsets = [0, ...this.rotations
            .map(playlistItem => playlistItem.duration)
            .map((duration, index, arr) => arr
                .slice(0, index + 1)
                .reduce((acc, current) => acc + current))
            .slice(0, this.rotations.length - 1)
        ];
        return this.rotations.findIndex((map, index) => offsets[index] + map.duration > offset);
    };

    getOffsetByIndex(index) {
        const targetIndex = this.normaliseIndex(index);
        if (targetIndex === 0) return 0;
        return (this.rotations
            .map(rotation => rotation.duration)
            .slice(0, targetIndex)
            .reduce((acc, current) => current + acc));
    };

    normaliseIndex(target) {
        if (target < this.rotations.length) return target;
        return target % this.rotations.length;
    };

    getPlaylistTimeElapsed(date) {
        if (date && !isParseableDate(date))
            throw new Error(`Unable to parse '${date}' to a Date`);

            const startDate = (this.rotationBaseTime.getTime());
            const targetDate = date
                ? (parseDate(date).getTime())
                : (new Date().getTime());

        const offset = (targetDate - startDate) % this.playlistRotationsDuration;
        if (Number.isNaN(offset))
            throw new Error(`Unable to get requested offset; got '${offset}'`);

        return offset;
    };

    getMapByDate(date) {
        if (date && !isParseableDate(date))
            throw new Error(`Couldn't parse ${date} into a Date`);

        const targetDate = date ? parseDate(date) : new Date();

        // Only return dates within season bounds
        if(targetDate < this.startTime) return null;
        if(targetDate > this.endTime) return null;

        const targetIndex = this.getIndexByOffset(this.getPlaylistTimeElapsed(targetDate));
        const targetRotation = this.rotations[targetIndex];
        const mapTimeElapsed = this.getPlaylistTimeElapsed(targetDate) - this.getOffsetByIndex(targetIndex);
        const targetStartTime = new Date(targetDate - mapTimeElapsed);

        return new ScheduledPlaylistItem({
            mapName: targetRotation.map,
            mapDuration: targetRotation.duration,
            startTime: targetStartTime,
        }, this);
    };
};

module.exports = RotatingPlaylist;
