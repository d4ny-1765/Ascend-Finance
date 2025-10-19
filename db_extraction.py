import tarfile, os

ARCHIVE = "chroma_db.tar.gz"
TARGET  = "chroma_db"

if not os.path.isdir(TARGET):
    if not os.path.isfile(ARCHIVE):
        raise FileNotFoundError(f"Archive {ARCHIVE} not found in {os.getcwd()}")
    print(f"Extracting {ARCHIVE} -> {TARGET}/ ...")
    with tarfile.open(ARCHIVE, "r:gz") as t:
        t.extractall(".")
    print("Done.")
else:
    print(f"{TARGET}/ already exists; nothing to extract.")