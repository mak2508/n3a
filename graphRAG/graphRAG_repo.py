import argparse
import subprocess
import sys
import shutil
import os

class GraphRAGIndexer:
    def __init__(self, client="test_client", client_description=""):
        self.root_dir = f"./graphRAG/{client}"
        self.client = client
        self.client_description = client_description

    def init_workspace(self):
        """Initializes the workspace by creating required configuration files."""
        cmd = ["python3", "-m", "graphrag.index", "--init", "--root", self.root_dir]

        # create the input folder if it does not exist  
        self._run_command(cmd, "Initializing workspace")

        # copy the env file to the root directory
        env_file_path = os.path.join(self.root_dir, ".env")
        shutil.copyfile("/home/abdelrahman/desktop/n3a/graphRAG/.env", env_file_path)


        if self.client_description:
            client_description_path = os.path.join(self.root_dir, "input", "client_description.txt")
            os.makedirs(os.path.dirname(client_description_path), exist_ok=True)
            with open(client_description_path, "w+") as f:
                f.write(self.client_description)
            print(f"Client description saved to {client_description_path}")

    def perform_indexing(self):
        """Performs indexing using the GraphRAG indexing pipeline."""
        cmd = ["python3", "-m", "graphrag.index", "--root", self.root_dir]
        self._run_command(cmd, "Performing indexing")

    def add_chat_to_index(self, file_path, client = None):
        """Adds a chat file to the input folder for indexing.

        Args:
            file_path (str): Path to the chat file to be added.
        """
        if client is not None:
            input_folder = os.path.join(self.root_dir, "input", client)
        else:
            input_folder = os.path.join(self.root_dir, "input")


        # Ensure the input folder exists
        if not os.path.exists(input_folder):
            print(f"Input folder does not exist at {input_folder}. Please initialize the workspace first.")
            return

        # Copy the chat file to the input folder
        try:
            shutil.copy(file_path, input_folder)
            print(f"Chat file {file_path} added to {input_folder}.")
        except Exception as e:
            print(f"Failed to add chat file: {e}", file=sys.stderr)


    def update_index(self, file_path, client = None):
        """Updates the index by adding a new file to the input folder and re-indexing.

        Args:
            file_path (str): Path to the new .txt file to be indexed.
        """

        if client is not None:
            input_folder = os.path.join(self.root_dir, "input", client)
        else:
            input_folder = os.path.join(self.root_dir, "input")

        # Ensure the input folder exists
        if not os.path.exists(input_folder):
            print(f"Input folder does not exist at {input_folder}. Please initialize the workspace first.")
            return

        # Copy the new file to the input folder
        try:
            shutil.copy(file_path, input_folder)
            print(f"Copied {file_path} to {input_folder}.")
        except Exception as e:
            print(f"Failed to copy file: {e}", file=sys.stderr)
            return

        # Perform indexing to update the index
        self.perform_indexing()




    def query_index(self, query, method="global"):
        """Queries the index using the specified method.

        Args:
            query (str): The query string.
            method (str): Query method ("global" or "local").
        """
        cmd = [
            "python3", "-m", "graphrag.query",
            "--root", self.root_dir,
            "--method", method,
            query
        ]
        self._run_command(cmd, "Querying index")

    def _run_command(self, cmd, description):
        """Runs a command using subprocess.

        Args:
            cmd (list): Command and arguments to run.
            description (str): Description for logging purposes.
        """
        print(f"{description} with command: {' '.join(cmd)}")
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error during {description.lower()}: {e}", file=sys.stderr)


if __name__== "__main__":

    #test class

    indexer = GraphRAGIndexer("dave", "dave is a bank client, very rich, very smart, very good at math, very good at finance, very good at everything")
    # Initialize the workspace
    indexer.init_workspace()
    # Add a chat file to the index
    indexer.add_chat_to_index("/home/abdelrahman/desktop/n3a/graphRAG/chat_samples/chat_0.txt")
    # Perform indexing
    indexer.perform_indexing()
    # Perform a query
    indexer.query_index("who is dave?", method="global")




    