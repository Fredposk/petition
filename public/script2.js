const h1 = document.getElementById('h1');
const btn = document.getElementById('btn');
const useOther = async () => {
    try {
        const latitude = 52.522;
        const longitude = 13.4133;
        async function getUserStations(latitude, longitude) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/nearby?latitude=${latitude}&longitude=${longitude}&results=4&distance=700`
            );
            let data = await response.json();

            return data;
        }
        const results = await getUserStations(latitude, longitude);
        // console.log(results);
        getIt(results);
        function getIt(results) {
            results.forEach((element) => {
                getAll(element.id);
            });
        }
        async function getAll(pram) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/${pram}/departures?results=2}`
            );
            let dataPre = await response.json();
            let data = Array.from(new Set(dataPre));

            data.forEach((element) => {
                console.log(
                    element.line.name,
                    element.stop.name,
                    new Date(element.when).toLocaleTimeString('en-US'),
                    element.direction
                );
                let result = `<tr class='overflow-hidden'>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.stop.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.line.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.direction}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${new Date(element.when).toLocaleTimeString('en-US')}
                    </td>
                </tr>`;
                h1.insertAdjacentHTML('afterend', result);
            });
        }
    } catch (error) {
        console.log('error in try block');
        setTimeout(() => {
            window.navigator.geolocation.getCurrentPosition(
                successfulLookup,
                useOther
            );
        }, 2000);
    }
};

const successfulLookup = async (position) => {
    try {
        const { latitude, longitude } = position.coords;
        async function getUserStations(latitude, longitude) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/nearby?latitude=${latitude}&longitude=${longitude}&results=4&distance=700`
            );
            let data = await response.json();

            return data;
        }
        const results = await getUserStations(latitude, longitude);
        // console.log(results);
        if (results.length == 0) {
            useOther();
        }
        getIt(results);
        function getIt(results) {
            results.forEach((element) => {
                getAll(element.id);
            });
        }
        async function getAll(pram) {
            let response = await fetch(
                `https://v5.bvg.transport.rest/stops/${pram}/departures?results=2}`
            );
            let dataPre = await response.json();
            let data = Array.from(new Set(dataPre));

            data.forEach((element) => {
                console.log(
                    element.line.name,
                    element.stop.name,
                    new Date(element.when).toLocaleTimeString('en-US'),
                    element.direction
                );
                let result = `<tr class='overflow-hidden'>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.stop.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.line.name}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${element.direction}
                    </td>
                    <td class='px-1 overflow-hidden border-2 border-gray-500'>
                        ${new Date(element.when).toLocaleTimeString('en-US')}
                    </td>
                </tr>`;
                h1.insertAdjacentHTML('afterend', result);
            });
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
