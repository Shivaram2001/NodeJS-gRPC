const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { count } = require("console");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "protos", "greeter.proto");

const packageDefination = protoLoader.loadSync(PROTO_PATH);

const proto = grpc.loadPackageDefinition(packageDefination).greeter;

function main()
{
    const client = new proto.Greeter("localhost:5050", grpc.credentials.createInsecure());

    // -------------- Unidirectional client request --------------
    // client.SayHello({name: "Shivarama", age: 24}, (err, response) => {
    //     if(err)
    //     {
    //        console.log(err); 
    //     }
    //     else
    //     {
    //         console.log(response.message);
    //     }
    // });

    // -------------- Server streaming --------------
    // const call = client.GetNumbers({count: 12});
    // call.on("data", (response) => {
    //     console.log(`order ${response.order} - Number ${response.number}`);
    // });

    // call.on("end", () => {
    //     console.log("Stream ended");
    // });

    // -------------- Client streaming --------------
    // const call = client.SumNumbers((err, response) => {
    //     if(err)
    //     {
    //         return console.log(err);
    //     }
    //     console.log(`Sum is = ${response.number}`);
    // });

    // call.write({number: 5});
    // call.write({number: 7});
    // call.write({number: 3});
    // call.write({number: 9});
    // call.write({number: 10});

    // call.end();

    // -------------- Bi-Directional streaming --------------
    const call = client.Chat();
    call.on("data", (chatMessage) => {
        console.log(`${chatMessage.user} : ${chatMessage.message}`);
    });

    call.write({user: "Shiva", message:"Hi"});
    call.write({user: "Rama", message:"Hello"});

    setInterval(() => {
        call.end();
    }, 3000)

    call.on("end", () => {
        console.log("Stream ended...");
        call.end();
    });

}

main();