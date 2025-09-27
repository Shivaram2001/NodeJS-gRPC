const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const ReflectionService  = require("@grpc/reflection");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "protos" , "greeter.proto");

const packageDefination = protoLoader.loadSync(PROTO_PATH);

const proto = grpc.loadPackageDefinition(packageDefination).greeter;
const reflection = new ReflectionService.ReflectionService(packageDefination);

function SayHello(call, callback)
{
    const replay = {message: `Hello ${call.request.name} your age is ${call.request.age} !!!`};
    callback(null, replay);
}

function GetNumbers(call)
{
    const count = call.request.count;
    let current = 1;
    const interval = setInterval(() => {
        if(current > count)
        {
            clearInterval(interval);
            call.end();
            return;
        }
        call.write({order: current, number: current * 100})
        current++;
    }, 1000);
}

function SumNumbers(call, callback) {
    let sum = 0;
    call.on("data", (request) => {
        sum += request.number;
    });

    call.on("end", () => {
        console.log(sum);
        callback(null, {number: sum});
    });

}

function Chat(call){
    call.on("data", (chatMessage) => {
        console.log(`${chatMessage.user} : ${chatMessage.message}`);
        call.write({
            user : "Server",
            message: `You said ${chatMessage.message}`
        });
    });

    call.on("end", () => {
        console.log("Client Disconnected...");
        call.end();
    });
}

function main()
{
    const server = new grpc.Server();
    server.addService(proto.Greeter.service, {SayHello: SayHello, GetNumbers: GetNumbers, SumNumbers: SumNumbers, Chat: Chat});
    server.bindAsync("0.0.0.0:5050", grpc.ServerCredentials.createInsecure(), (err, port) => {
        if(err)
        {
            console.error("Failed to bind:", err);
            return;
        }
        console.log(`Server running in port ${port}...`);
    });

    reflection.addToServer(server);
}

main();