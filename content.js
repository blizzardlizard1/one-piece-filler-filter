// Define the URL and headers
const url = 'https://api.anime-skip.com/graphql';
const headers = {
    'content-type': 'application/json',
    'x-client-id': 'kfr87Ftg6nKhaAhyJ0K3ZKwOZ2MJqmXW'
};

// Define the GraphQL query
const query = `
    query {
        searchShows(search: "One Piece", limit: 1) {
            id
            name
            episodeCount
            episodes {
                number
                name
                timestamps {
                    at
                    type {
                        name
                    }
                }
            }
        }
    }
`;

// Function to extract the current episode number
function getCurrentEpisodeNumber() {
    const titleElement = document.querySelector('h1.title');
    if (titleElement) {
        const titleText = titleElement.textContent.trim();
        console.log('Title text:', titleText);
        const match = titleText.match(/E(\d+)/);
        if (match) {
            const episodeNumber = parseInt(match[1], 10);
            console.log('Extracted episode number:', episodeNumber);
            return episodeNumber;
        }
    }
    console.error('Could not determine current episode number');
    return null;
}
// Function to skip filler segments
function skipFillerSegments(fillerTimestamps) {
    const videoPlayer = document.querySelector('video'); // Adjust selector as needed

    if (videoPlayer) {
        fillerTimestamps.forEach(ts => {
            const start = ts.at;
            const end = ts.at + ts.duration; // Assuming you have duration in the timestamp

            videoPlayer.addEventListener('timeupdate', () => {
                if (videoPlayer.currentTime >= start && videoPlayer.currentTime < end) {
                    videoPlayer.currentTime = end;
                }
            });
        });
    }
}

// Make the POST request using fetch
fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: query })
})
.then(response => response.json())
.then(data => {
    const show = data.data.searchShows[0];
    const episodes = show.episodes;

    // Get the current episode number dynamically
    const currentEpisodeNumber = getCurrentEpisodeNumber();

    if (currentEpisodeNumber !== null) {
        const currentEpisode = episodes.find(ep => ep.number === currentEpisodeNumber);

        if (currentEpisode) {
            const timestamps = currentEpisode.timestamps;
            const fillerTimestamps = timestamps.filter(ts => ts.type.name === 'Filler');
            console.log(fillerTimestamps); // Handle the filler timestamps
            skipFillerSegments(fillerTimestamps);
        } else {
            console.error('Episode not found in API data');
        }
    } else {
        console.error('Could not determine current episode number');
    }
})
.catch(error => {
    console.error('Error:', error);
});