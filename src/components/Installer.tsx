import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export type TappletProps = {
  tappletId: string;
};

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

  async function downloadTar() {
    await invoke("download_tapplet", { url, name });
  }

  function extractTar() {
    invoke("extract_tapp_tarball", { tappletPath: path });
  }

  function checkFiles() {
    invoke("check_tapp_files", { tappletPath: path });
  }

  async function calculateShasum() {
    console.log("calculate shasum");
    const calculatedChecksum: string = await invoke("calculate_tapp_checksum", {
      tappletPath: path,
    });

    const areEq: boolean = await invoke("validate_tapp_checksum", {
      checksum: calculatedChecksum,
      tappletPath: path,
    });
    setChecksumCorrectness(areEq);
    console.log(areEq);
  }

  async function downloadAndExtract() {
    await invoke("download_tapp", { url, tappletPath: path });
    invoke("extract_tapp_tarball", { tappletPath: path });
    invoke("check_tapp_files", { tappletPath: path });
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
