import React from "react";
import "./Loading.css";
import { Commet } from "react-loading-indicators";

export default function Loading() {

    return (
        <div  className="loading">
            <Commet color="#3573f5" size="small" text="Top soft" textColor="" />
        </div>
    );
}