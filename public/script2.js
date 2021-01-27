const h1 = document.getElementById('h1');
const btn = document.getElementById('btn');
const useOther = async () => {
    try {
        const latitude = 52.522;
        const longitude = 13.4133;
        async function getUserStations(latitude, longitude) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/nearby?latitude=${latitude}&longitude=${longitude}&results=4&distance=700`,
                { mode: 'cors' }
            );
            let data = await response.json();
            return data;
        }
        const results = await getUserStations(latitude, longitude);
        results.map((id) => getAll(id.id));
        async function getAll(id) {
            async function getUserDepartures(id) {
                let response = await fetch(
                    `https://v5.bvg.transport.rest/stops/${id}/departures?results=5}`,
                    { mode: 'cors' }
                );
                let data = await response.json();
                return data;
            }
            const [departures] = await getUserDepartures(id);
            let time = new Date(departures.when).toLocaleTimeString('en-US');
            let result = `<tr class='overflow-hidden'>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.stop.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.line.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.direction}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${time}
                    </td>
                </tr>`;
            h1.insertAdjacentHTML('afterend', result);
        }
    } catch (error) {
        console.log('error in try block');
        return;
    }
};

const successfulLookup = async (position) => {
    try {
        const { latitude, longitude } = position.coords;
        async function getUserStations(latitude, longitude) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/nearby?latitude=${latitude}&longitude=${longitude}&results=4&distance=700`,
                { mode: 'cors' }
            );
            let data = await response.json();
            if (data.length == 0) {
                useOther();
            }
            return data;
        }
        const results = await getUserStations(latitude, longitude);
        results.map((id) => getAll(id.id));
        async function getAll(id) {
            async function getUserDepartures(id) {
                let response = await fetch(
                    `https://v5.bvg.transport.rest/stops/${id}/departures?results=5}`,
                    { mode: 'cors' }
                );
                let data = await response.json();
                return data;
            }
            const [departures] = await getUserDepartures(id);
            let time = new Date(departures.when).toLocaleTimeString('en-US');
            let result = `<tr class='overflow-hidden'>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.stop.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.line.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${departures.direction}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${time}
                    </td>
                </tr>`;
            h1.insertAdjacentHTML('afterend', result);
        }
    } catch (error) {
        console.log('error in try block using geolocation');

        setTimeout(() => {
            window.navigator.geolocation.getCurrentPosition(
                successfulLookup,
                useOther
            );
        }, 2000);
    }
};

btn.addEventListener('click', () => {
    location.reload();
});
window.navigator.geolocation.getCurrentPosition(successfulLookup, useOther);
