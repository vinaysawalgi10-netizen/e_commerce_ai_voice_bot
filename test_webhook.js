import axios from "axios";

const test = async () => {
    try {
        const response = await axios.post("http://localhost:3000/webhook", {
            name: "get_order_status",
            order_id: "ORD1001"
        }, {
            headers: {
                "x-api-key": "my_test_secret_123"
            }
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.status : error.message);
    }
};

test();
