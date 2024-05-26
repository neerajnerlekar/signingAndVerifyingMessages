"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { schema } from "~~/verifyForm/verifySchema";

export const VerifyMessageForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    defaultValues: {
      senderAddress: "",
      toAddress: "",
      amount: 0,
      message: "",
      nonce: 0,
      signature: "",
    },
  });

  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [args, setArgs] = useState<
    [
      string | undefined,
      string | undefined,
      bigint | undefined,
      string | undefined,
      bigint | undefined,
      `0x${string}` | undefined,
    ]
  >([undefined, undefined, undefined, undefined, undefined, undefined]);

  const { data: verified, refetch } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "verify",
    args: args || [],
  });

  const formSubmit = async (data: z.infer<typeof schema>) => {
    const { senderAddress, toAddress, amount, message, nonce, signature } = data;

    setArgs([
      senderAddress,
      toAddress,
      BigInt(amount.toString()),
      message,
      BigInt(nonce.toString()),
      `0x${signature.slice(2)}`,
    ]);

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
  };

  return (
    <>
      <h1>Verify Message</h1>
      <form onSubmit={handleSubmit(formSubmit)}>
        <label className="input input-bordered flex items-center gap-2">
          Sender Address
          <input {...register("senderAddress", { required: true })} placeholder="Input Sender address" />
          {errors.senderAddress && <p className="error">Sender Address is required.</p>}
        </label>

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

        <label className="input input-bordered flex items-center gap-2">
          Sender Address
          <input {...register("signature", { required: true })} placeholder="Input Signature" />
          {errors.senderAddress && <p className="error">Signature is required.</p>}
        </label>
        <input className="btn btn-active btn-primary" type="submit" value="Verify" />
      </form>
      <div>
        {verificationResult ? (
          <p>{`Message Verified: ${verified}`}</p>
        ) : (
          <p>Verification result will be displayed here.</p>
        )}
      </div>
    </>
  );
};
