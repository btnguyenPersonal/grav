let colors = {
    white: '#FFFFFF',
    black: '#000000',
    green: '#00FF00',
    yellow: '#FFFF00',
    orange: '#FFA500',
    blue: '#0000FF',
    red: '#FF0000',
}
let pause = false;
let gravity = 1;
let centerOnPlanetId;
let viewport = {
    backgroundColor: colors.white,
    zoom: 1,
    height: 900,
    width: 900,
    x: 0,
    y: 0,
    center: {
        x: 0,
        y: 0,
    },
};
let rawPlanets = [
        {
            color: colors.yellow,
            mass: 600,
            size: 60,
            pos_x: 0,
            pos_y: 0,
            vel_x: 0,
            vel_y: 0
        },
        {
            color: colors.blue,
            mass: 6,
            size: 6,
            pos_x: 133.2,
            pos_y: 133.2,
            vel_x: -6,
            vel_y: 4.2
        },
        {
            color: colors.orange,
            mass: 15,
            size: 9,
            pos_x: 0,
            pos_y: -90,
            vel_x: 6,
            vel_y: 0
        },
        {
            color: colors.green,
            mass: 9,
            size: 3,
            pos_x: 60,
            pos_y: 90,
            vel_x: -6,
            vel_y: 6
        }
];

function generateIds(rawPlanets) {
    let i = 0;
    return rawPlanets.map((planet) => {
        i++;
        return {
            ...planet,
            id: i
        };
    });
}
let planets = generateIds(rawPlanets);
let showAxis = true;
let showUser = true;

function getCircle(viewport, size, x, y, color) {
    return `
        <div style="
            background-color: ${color};
            border: solid 1px;
            border-radius: 100%;
            position: absolute;
            top: ${viewport.height / 2 + (viewport.zoom * (y - viewport.center.y))}px;
            left: ${viewport.width / 2 + (viewport.zoom * (x - viewport.center.x))}px;
            height: ${viewport.zoom * size}px;
            width: ${viewport.zoom * size}px;
            transform: translateX(-${(viewport.zoom * size) / 2}px) translateY(-${(viewport.zoom * size) / 2}px);
        "></div>
    `;
}

function draw(viewport, planet) {
    let color = planet.color;
    if (planets.some(p => isTouching(p, planet))) {
        color = colors.red;
    }
    return getCircle(viewport, planet.size, planet.pos_x, planet.pos_y, color);
}

function getAxis(viewport) {
    return `
        <div>
            <div style="
                background-color: ${colors.black};
                height: 1px;
                width: ${viewport.height}px;
                position: absolute;
                top: ${viewport.height / 2}px;
                left: 0px;
            "></div>
            <div style="
                background-color: ${colors.black};
                height: ${viewport.height}px;
                width: 1px;
                position: absolute;
                top: 0px;
                left: ${viewport.width / 2}px;
            "></div>
        </div>
    `;
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="position:absolute;top:${viewport.y};left:${viewport.x};background-color:${viewport.backgroundColor};height:${viewport.height}px;width:${viewport.width}px">
            <div id="simulator"></div>
            <div style="position:absolute;top:${viewport.height + 10}px;">
                <button id="pause" data-action="pause">pause</button>
                <br></br>
                zoom:&nbsp;
                <input id="zoom" placeholder="${viewport.zoom}" style="width:50px"></input>
                <br></br>
                centerOnPlanet:&nbsp;
                <input id="centerOnPlanetId" style="width:50px"></input>
                <br></br>
                <button id="apply">apply</button>
            </div>
        </div>
    `;
    document.getElementById('pause').addEventListener('click', () => { pause = !pause; render() });
    document.getElementById('apply').addEventListener('click', () => {
        if (document.getElementById('centerOnPlanetId').value) {
            centerOnPlanetId = parseInt(document.getElementById('centerOnPlanetId').value);
        } else {
            viewport.center = {
                x: 0,
                y: 0
            };
        }
        if (document.getElementById('zoom').value) {
            viewport.zoom = document.getElementById('zoom').value;
        }
        planets = generateIds(rawPlanets);
    });
}

function renderSimulator() {
    const simulator = document.getElementById('simulator');
    simulator.innerHTML = `
        <div>
            ${showAxis === true && getAxis(viewport)}
            ${planets.map((planet) => draw(viewport, planet)).join('')}
            <div style="height:${viewport.height}px;width:${viewport.height}px;"></div>
        </div>
    `;
}

function movePlanets(planets) {
    const output = [...planets];
    output.forEach((planet) => {
        planet.pos_x += planet.vel_x;
        planet.pos_y += planet.vel_y;
    });
    return output;
}

function isTouching(planet1, planet2) {
    const x_dir = planet1.pos_x - planet2.pos_x;
    const y_dir = planet1.pos_y - planet2.pos_y;
    const distance = Math.sqrt(x_dir ** 2 + y_dir ** 2);
    return planet1.id !== planet2.id && distance < (planet1.size / 2 + planet2.size / 2);
}

function applyGravity(planets) {
    output = [...planets];
    output.forEach((outputPlanet) => {
        moveX = 0;
        moveY = 0;
        planets.forEach((planet) => {
            if (planet.id !== outputPlanet.id) {
                const x_dir = planet.pos_x - outputPlanet.pos_x;
                const y_dir = planet.pos_y - outputPlanet.pos_y;
                const distance = Math.sqrt(x_dir ** 2 + y_dir ** 2);
                const magnitude = gravity * (planet.mass / outputPlanet.mass) / (distance ** 2);
                moveX += magnitude * x_dir;
                moveY += magnitude * y_dir;
            }
        })
        outputPlanet.vel_x += moveX;
        outputPlanet.vel_y += moveY;
    });
    return output;
}

function applyCollisions(planets) {
    let deadPlanetIds = [];
    output = [...planets];
    output.forEach((outputPlanet) => {
        if (!deadPlanetIds.includes(outputPlanet.id)) {
            moveX = 0;
            moveY = 0;
            planets.forEach((planet) => {
                if (planet.id !== outputPlanet.id && isTouching(planet, outputPlanet)) {
                    outputPlanet.vel_y = (planet.mass * planet.vel_y + outputPlanet.mass * outputPlanet.vel_y) / (planet.mass + outputPlanet.mass);
                    outputPlanet.vel_x = (planet.mass * planet.vel_x + outputPlanet.mass * outputPlanet.vel_x) / (planet.mass + outputPlanet.mass);
                    outputPlanet.mass += planet.mass;
                    deadPlanetIds.push(planet.id);
                }
            })
        }
    });
    return output.filter(p => !deadPlanetIds.includes(p.id));
}

function centerPlanet(viewport, planets, centerOnPlanetId) {
    if (centerOnPlanetId) {
        let temp = JSON.parse(JSON.stringify(viewport));
        const p = planets.find(planet => centerOnPlanetId === planet.id);
        temp.center.x = p.pos_x;
        temp.center.y = p.pos_y;
        return temp;
    } else {
        return viewport;
    }
}

setInterval(() => {
    if (!pause) {
        planets = movePlanets(planets);
        planets = applyGravity(planets);
        planets = applyCollisions(planets);
        viewport = centerPlanet(viewport, planets, centerOnPlanetId);
    }
    renderSimulator();
}, 10)

render();

