use base64::{ engine::general_purpose, Engine as _ };
use sha2::Digest;
use std::fs;
use std::fs::read_dir;
use std::io::Read;
use std::num::ParseIntError;
use std::path::Path;

fn calculate_hash(data: &[u8], sha: usize) -> String {
  let strout: String = match sha {
    224 => format!("{:x}", sha2::Sha224::digest(&data)),
    256 => format!("{:x}", sha2::Sha256::digest(&data)),
    384 => format!("{:x}", sha2::Sha384::digest(&data)),
    512 => format!("{:x}", sha2::Sha512::digest(&data)),
    _ => format!("{:x}", sha1::Sha1::digest(&data)),
  };
  strout
}

fn read_data(path: &Path, sha: usize) -> String {
  let mut results = Vec::new();
  if path.is_dir() {
    let paths = read_dir(path).unwrap();
    for entry in paths {
      if let Ok(entry) = entry {
        if entry.path().is_file() {
          if let Ok(mut file) = fs::File::open(&entry.path()) {
            let mut data = Vec::new();
            file.read_to_end(&mut data).unwrap();
            let strout = calculate_hash(&data, sha);
            results.push(strout + "    " + entry.path().to_str().unwrap());
          }
        }
      }
    }
  } else {
    if let Ok(mut file) = fs::File::open(&path) {
      let mut data = Vec::new();
      file.read_to_end(&mut data).unwrap();
      let strout = calculate_hash(&data, sha);
      results.push(strout);
    }
  }
  return results.join("\n");
}

fn decode_hex(s: &str) -> Result<Vec<u8>, ParseIntError> {
  (0..s.len())
    .step_by(2)
    .map(|i| u8::from_str_radix(&s[i..i + 2], 16))
    .collect()
}

pub fn calculate_checksum(path: &str) -> Result<String, String> {
  // sha-512
  let sha: usize = 512;
  let tarball_file = Path::new(path).join("tapplet.tar.gz");

  // calculate sha and convert
  let shasum_output = read_data(&tarball_file, sha);
  let decoded_shasum = decode_hex(&shasum_output).unwrap();
  let converted_shasum = general_purpose::STANDARD.encode(decoded_shasum);

  // format output to match `integrity` field from manifest.json
  let calculated_integrity = format!("{}{}", "sha512-", converted_shasum.replace("\n", ""));
  Ok(calculated_integrity)
}
