"use client";

import { useState } from "react";
import { injected } from "@wagmi/connectors";
import { connect, getAccount } from "@wagmi/core";
import { useForm } from "react-hook-form";
import { localhost } from "viem/chains";
import { createConfig, http } from "wagmi";
import { signMessage } from "wagmi/actions";
import { z } from "zod";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { signSchema } from "~~/verifyForm/verifySchema";

const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http("http://localhost:8545"),
  },
});

export const MessageToVerifyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signSchema>>({
    defaultValues: {
      toAddress: "",
      amount: 0,
      message: "",
      nonce: 0,
    },
  });

  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [args, setArgs] = useState<[string | undefined, bigint | undefined, string | undefined, bigint | undefined]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const [signature, setSignature] = useState(null);

  const { data: messageHash, refetch } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getMessageHash",
    args: args || [],
  });

  const formSubmit = async (data: z.infer<typeof signSchema>) => {
    const { toAddress, amount, message, nonce } = data;

    setArgs([toAddress, BigInt(amount), message, BigInt(nonce)]);

    if (args) {
      const { data, error } = await refetch(args);
      // Assuming data is a boolean indicating success, and error contains any failure details
      if (!error && data !== undefined) {
        setVerificationResult(data);
      } else {
        // Handle error case appropriately, perhaps by setting an error state or message
        console.log("Error verifying message:", error);
      }
    }

    await connect(config, { connector: injected() });

    await getAccount(config);

    const safeMessageHash = messageHash || "0x";

    const signature = await signMessage(config, {
      message: { raw: safeMessageHash },
    });

    console.log(signature);

    setSignature(signature);

    // const signature = await window.ethereum?.request({ method: "personal_sign", params: [account, messageHash] });

    // console.log(result);

    // const account = await getAccount(config);

    // console.log(account);

    // console.log(await injected.call({ method: "personal_sign", params: [account, messageHash] }));
  };

  return (
    <>
      <h1>Sign Message to Verify</h1>
      <form onSubmit={handleSubmit(formSubmit)}>
        <label className="input input-bordered flex items-center gap-2">
          To Address
          <input {...register("toAddress", { required: true })} placeholder="Input To address" />
          {errors.toAddress && <p className="error">To Address is required.</p>}
        </label>

        <label className="input input-bordered flex items-center gap-2">
          Amount
          <input
            {...register("amount", { required: true })}
            type="number"
            min="0"
            className="grow"
            placeholder="Enter Amount"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          Message
          <input
            {...register("message", { required: true, minLength: 2 })}
            type="text"
            className="grow"
            placeholder="Search"
          />
          {errors.message && <p className="error">Message is required.</p>}
        </label>

        <label className="input input-bordered flex items-center gap-2">
          Nonce
          <input
            {...register("nonce", { required: true })}
            type="number"
            min="0"
            className="grow"
            placeholder="Enter Nonce"
          />
        </label>

        <input className="btn btn-active btn-primary" type="submit" value="Sign Message" />
      </form>

      <div>
        {signature && (
          <div className="card w-96 bg-base-100 shadow-xl ">
            <div className="card-actions justify-center" style={{ wordBreak: "break-all" }}>
              <p>{signature}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
