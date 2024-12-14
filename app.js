let color_white = '#FFFFFF';
let color_black = '#000000';
let color_green = '#00FF00';
let color_yellow = '#FFFF00';
let color_orange = '#FFA500';
let color_blue = '#0000FF';
let color_red = '#FF0000';
let pause = false;
let gravity = 1;
let viewport = {
    backgroundColor: color_white,
    height: 900,
    width: 900,
    x: 0,
    y: 0
};
let planets = [
    {
        color: color_yellow,
        mass: 900,
        size: 100,
        pos_x: 0,
        pos_y: 0,
        vel_x: 0,
        vel_y: 0,
    },
    {
        color: color_blue,
        mass: 10,
        size: 10,
        pos_x: 222,
        pos_y: 15,
        vel_x: -10,
        vel_y: 10,
    },
    {
        color: color_orange,
        mass: 15,
        size: 10,
        pos_x: 0,
        pos_y: -150,
        vel_x: -10,
        vel_y: 10,
    },
    {
        color: color_green,
        mass: 15,
        size: 10,
        pos_x: 100,
        pos_y: 15,
        vel_x: -10,
        vel_y: 10,
    },
]
let i = 0;
planets = planets.map((planet) => {
    i++;
    return {
        ...planet,
        id: i
    };
});
let showAxis = true;
let showUser = true;

function getCircle(viewport, size, x, y, color) {
    return `
        <div style="
            background-color: ${color};
            border: solid 1px;
            border-radius: 100%;
            position: absolute;
            top: ${viewport.height / 2 + y}px;
            left: ${viewport.width / 2 + x}px;
            height: ${size}px;
            width: ${size}px;
            transform: translateX(-${size / 2}px) translateY(-${size / 2}px);
        "></div>
    `;
}

function draw(viewport, planet) {
    let color = planet.color;
    if (planets.some(p => isTouching(p, planet))) {
        color = color_red;
    }
    return getCircle(viewport, planet.size, planet.pos_x, planet.pos_y, color);
}

function getAxis(viewport) {
    return `
        <div>
            <div style="
                background-color: ${color_black};
                height: 1px;
                width: ${viewport.height}px;
                position: absolute;
                top: ${viewport.height / 2}px;
                left: 0px;
            "></div>
            <div style="
                background-color: ${color_black};
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
        <div>
            <div style="position:absolute;top:${viewport.y};left:${viewport.x};background-color:${viewport.backgroundColor};height:${viewport.height}px;width:${viewport.width}px">
                ${showAxis === true && getAxis(viewport)}
                ${planets.map((planet) => draw(viewport, planet)).join('')}
                <div style="height:${viewport.height}px;width:${viewport.height}px;"></div>
                <button data-action="pause">pause</button>
            </div>
        </div>
    `;
}
render();

function movePlanets(planets) {
    planets.forEach((planet) => {
        planet.pos_x += planet.vel_x;
        planet.pos_y += planet.vel_y;
    });
    return planets;
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
    planets = output;
    return planets.filter(p => !deadPlanetIds.includes(p.id));
}

setInterval(() => {
    if (!pause) {
        planets = movePlanets(planets);
        planets = applyGravity(planets);
        planets = applyCollisions(planets);
        console.log(planets);
        render();
    }
}, 10)
