import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { TappletProps } from "./Tapplet";

export function Installer({ tappletId }: TappletProps) {
  //TODO use Tauri BaseDir
  const basePath = "/home/oski/Projects/tari/tari-universe/tapplets_installed";

  //TODO get tapplet data from registry with tappletId
  const [name, setName] = useState("tapplet-name");
  const [url, setUrl] = useState(
    "https://registry.npmjs.org/aa-schnorr-multisig/-/aa-schnorr-multisig-1.0.6.tgz",
  );
  const [checksumCorrectness, setChecksumCorrectness] = useState(false);
  const [path, setPath] = useState(basePath);

  async function calculateShasum() {
    const calculatedChecksum: string = await invoke("calculate_tapp_checksum", {
      tappletPath: path,
    });

    /**
      TODO uncomment if extracted tapplet folder contains tapplet.manifest.json file
      with "integrity" field
      
      const areEq: boolean = await invoke("validate_tapp_checksum", {
        checksum: calculatedChecksum,
        tappletPath: path,
      });
    */
    const isCheckumCorrect = true;
    setChecksumCorrectness(isCheckumCorrect);
  }

  async function downloadAndExtract() {
    await invoke("download_tapp", { url, tappletPath: path });
    await invoke("extract_tapp_tarball", { tappletPath: path });
    await invoke("check_tapp_files", { tappletPath: path });
    await calculateShasum();
  }

  return (
    <div className="container">
      <p>Tapplet path: {path}</p>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          downloadAndExtract();
        }}
      >
        <input
          id="url-input"
          onChange={(e) => setUrl(e.currentTarget.value)}
          placeholder={url}
        />
        <input
          id="url-input"
          onChange={(e) => setPath(e.currentTarget.value)}
          placeholder={path}
        />
        <input
          id="url-input"
          onChange={(e) => {
            setName(e.currentTarget.value);
            setPath(`${basePath}/${e.currentTarget.value}`);
          }}
          placeholder={name}
        />
        <button type="submit">Install</button>
      </form>

      <div>
        <p>
          Checksum
          {checksumCorrectness ? " valid " : " invalid "}
        </p>
      </div>
    </div>
  );
}
